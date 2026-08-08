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
      unitPool: config.unitPool || config.units || [],
      unitWeights: config.unitWeights || null
    };

    this.difficultyConfig = config;
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

    const spawnPos = this.chooseSpawnPosition(arenaSize, playerUnits);
    this.gameState.enemyEnergy -= bestChoice.cost;
    this.onSpawn(bestChoice, spawnPos.x, spawnPos.y);
  }

  chooseUnit(affordable, playerUnits) {
    const threatLevel = playerUnits.reduce((sum, u) => sum + u.hp, 0);

    const sorted = [...affordable].sort((a, b) => {
      const valueA = (a.hp + a.damage * 4) / Math.max(1, a.cost);
      const valueB = (b.hp + b.damage * 4) / Math.max(1, b.cost);
      return valueB - valueA;
    });

    if (sorted.length === 1) return sorted[0];

    const aggression = this.config.aggression ?? 0.5;
    const roll = Math.random();

    if (threatLevel > 300 && roll < aggression) {
      return sorted[0];
    }

    // sélection semi-aléatoire parmi les 2-3 meilleures
    const top = sorted.slice(0, Math.min(3, sorted.length));
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