import { GeometryUtils } from "./GeometryUtils.js";

export class AIController {
  constructor({ gameState, unitDefinitions, difficultyConfig, onSpawn }) {
    this.gameState = gameState;
    this.unitDefinitions = unitDefinitions;
    this.onSpawn = onSpawn;

    this.configure(difficultyConfig || {});
  }

  configure(config) {
    this.config = {
      decisionInterval: config.decisionInterval ?? 1.5,
      startingEnergy: config.startingEnergy ?? 5,
      energyRegenRate: config.energyRegenRate ?? 1,
      energyRegenInterval: config.energyRegenInterval ?? 1800,
      unitPool: config.unitPool || [],
      aggression: config.aggression ?? 0.5,
      behavior: config.behavior || "balanced"
    };

    this.decisionCooldown = 0;
    this.gameState.enemyEnergy = this.config.startingEnergy;
    this.energyRegenAccumulator = 0;
  }

  update(deltaSeconds, arenaSize) {
    if (this.gameState.isGameOver) return;

    this.regenEnergy(deltaSeconds);

    this.decisionCooldown -= deltaSeconds;
    if (this.decisionCooldown > 0) return;

    this.decisionCooldown = this.config.decisionInterval;
    this.makeDecision(arenaSize);
  }

  regenEnergy(deltaSeconds) {
    this.energyRegenAccumulator += deltaSeconds * 1000;

    if (this.energyRegenAccumulator >= this.config.energyRegenInterval) {
      this.energyRegenAccumulator = 0;

      this.gameState.enemyEnergy = Math.min(
        this.gameState.maxEnergy,
        this.gameState.enemyEnergy + this.config.energyRegenRate
      );
    }
  }

  getAvailableUnits() {
    return (this.config.unitPool || [])
      .map((id) => this.unitDefinitions[id])
      .filter((def) => def && this.gameState.enemyEnergy >= def.cost);
  }

  makeDecision(arenaSize) {
    const affordable = this.getAvailableUnits();
    if (affordable.length === 0) return;

    const playerUnits = this.gameState.units.filter(
      (u) => u.team === "player" && !u.isDead && !u.isDestroyed
    );

    const bestChoice = this.chooseUnit(affordable, playerUnits);
    if (!bestChoice) return;

    if (this.gameState.enemyEnergy < bestChoice.cost) return;

    const requestedSpawnPos = this.chooseSpawnPosition(arenaSize, playerUnits);
    const obstacles = this.gameState.mapGeometry?.movement || [];

    const spawnPos = GeometryUtils.findNearestValidPosition(requestedSpawnPos.x, requestedSpawnPos.y, bestChoice.hitboxRadius || 20, obstacles, arenaSize);

    if (!spawnPos) return;

    this.gameState.enemyEnergy -= bestChoice.cost;
    this.onSpawn(bestChoice, spawnPos.x, spawnPos.y);
  }

  chooseUnit(affordable, playerUnits) {
    const threatLevel = playerUnits.reduce((sum, u) => sum + u.hp, 0);

    const scored = [...affordable].map((def) => {
      let score = 0;

      if (this.config.behavior === "rush") {
        score = (def.damage * 3 + def.attackSpeed * 2) / Math.max(1, def.cost);
      } else if (this.config.behavior === "tank") {
        score = def.hp / Math.max(1, def.cost);
      } else if (this.config.behavior === "pressure") {
        score = (def.damage * 5) / Math.max(1, def.cost);
      } else {
        score = (def.hp + def.damage * 4) / Math.max(1, def.cost);
      }

      if (threatLevel > 300) score *= 1.2;
      return { def, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const top = scored.slice(0, Math.min(3, scored.length)).map((x) => x.def);
    const aggression = this.config.aggression ?? 0.5;

    if (Math.random() < aggression || top.length === 1) {
      return top[0];
    }

    return top[Math.floor(Math.random() * top.length)];
  }

  chooseSpawnPosition(arenaSize, playerUnits) {
    const spawnY = arenaSize.height * 0.15;

    if (playerUnits.length === 0) {
      const laneOffset = Math.random() > 0.5 ? 0.28 : 0.72;
      return { x: arenaSize.width * laneOffset, y: spawnY };
    }

    const threatX =
      playerUnits.reduce((sum, u) => sum + u.x, 0) / playerUnits.length;

    return { x: threatX, y: spawnY };
  }
}