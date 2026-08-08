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
    this.energyRegenAccumulator += deltaSeconds;
    const step = 1 / Math.max(0.01, this.config.energyRegenRate);

    while (this.energyRegenAccumulator >= step) {
      this.energyRegenAccumulator -= step;
      this.gameState.enemyEnergy = Math.min(
        this.gameState.maxEnergy,
        this.gameState.enemyEnergy + 1
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

    if (threatLevel > 300) {
      return [...affordable].sort((a, b) => b.damage - a.damage)[0];
    }

    return [...affordable].sort((a, b) => b.hp / b.cost - a.hp / a.cost)[0];
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