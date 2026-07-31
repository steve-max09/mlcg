export class AIController {
  constructor({ gameState, unitDefinitions, difficultyConfig, onSpawn }) {
    this.gameState = gameState;
    this.unitDefinitions = unitDefinitions;
    this.difficultyConfig = difficultyConfig;
    this.onSpawn = onSpawn;

    this.decisionCooldown = 0;
    this.decisionInterval = difficultyConfig.decisionInterval || 1.5;
  }

  update(deltaSeconds, arenaSize) {
    if (this.gameState.isGameOver) return;

    this.decisionCooldown -= deltaSeconds;
    if (this.decisionCooldown > 0) return;

    this.decisionCooldown = this.decisionInterval;
    this.makeDecision(arenaSize);
  }

  getAvailableUnits() {
    return this.difficultyConfig.unitPool
      .map((id) => this.unitDefinitions[id])
      .filter((def) => this.gameState.enemyEnergy >= def.cost);
  }

  makeDecision(arenaSize) {
    const affordable = this.getAvailableUnits();
    if (affordable.length === 0) return;

    const playerUnits = this.gameState.units.filter(
      (u) => u.team === "player" && !u.isDead
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
      const highestDamage = [...affordable].sort((a, b) => b.damage - a.damage)[0];
      return highestDamage;
    }

    const sortedByValue = [...affordable].sort(
      (a, b) => b.hp / b.cost - a.hp / a.cost
    );
    return sortedByValue[0];
  }

  chooseSpawnPosition(arenaSize, playerUnits) {
    const centerX = arenaSize.width / 2;
    const spawnY = arenaSize.height * 0.15;

    if (playerUnits.length === 0) {
      const laneOffset = Math.random() > 0.5 ? 0.28 : 0.72;
      return { x: arenaSize.width * laneOffset, y: spawnY };
    }

    const threatX =
      playerUnits.reduce((sum, u) => sum + u.x, 0) / playerUnits.length;
    const mirroredX = threatX;

    return { x: mirroredX, y: spawnY };
  }
}