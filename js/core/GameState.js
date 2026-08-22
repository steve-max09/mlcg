export class GameState {
  constructor() {
    this.units = [];
    this.towers = [];
    this.energy = 5;
    this.enemyEnergy = 5;
    this.maxEnergy = 10;
    this.energyRegenRate = 1;
    this.energyRegenInterval = 1800;
    this.isGameOver = false;
    this.winner = null;
  }

  addUnit(unit) {
    this.units.push(unit);
  }

  addTower(tower) {
    this.towers.push(tower);
  }

  removeDeadUnits() {
    this.units = this.units.filter((u) => !u.isDead);
  }

  canAfford(cost) {
    return this.energy >= cost;
  }

  spendEnergy(cost) {
    this.energy = Math.max(0, this.energy - cost);
  }

  regenEnergy() {
    this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate);
  }

  getEnemiesOf(team) {
    return this.units.filter((u) => u.team !== team && !u.isDead);
  }

  getTowersOf(team) {
    return this.towers.filter((t) => t.team === team && !t.isDestroyed);
  }

  checkVictory() {
    if (this.isGameOver) return;

    const playerStructures = this.towers.filter((tower) => tower.team === "player");
    const enemyStructures = this.towers.filter((tower) => tower.team === "enemy");

    if (this.mapId === "middleWall") {
      const playerStructureDestroyed = playerStructures.some((tower) => tower.isDestroyed || tower.isDead);
      const enemyStructureDestroyed = enemyStructures.some((tower) => tower.isDestroyed || tower.isDead);

      if (playerStructureDestroyed) {
        this.isGameOver = true;
        this.winner = "enemy";
      } else if (enemyStructureDestroyed) {
        this.isGameOver = true;
        this.winner = "player";
      }

      return;
    }

    const playerBase = playerStructures.find((tower) => tower.isBase) || playerStructures[0];
    const enemyBase = enemyStructures.find((tower) => tower.isBase) || enemyStructures[0];

    if (playerBase?.isDestroyed || playerBase?.isDead) {
      this.isGameOver = true;
      this.winner = "enemy";
    } else if (enemyBase?.isDestroyed || enemyBase?.isDead) {
      this.isGameOver = true;
      this.winner = "player";
    }
  }

  reset() {
    this.units = [];
    this.towers = [];
    this.energy = 5;
    this.enemyEnergy = 5;
    this.energyRegenRate = 1;
    this.energyRegenInterval = 1800;
    this.isGameOver = false;
    this.winner = null;
    this.mapId = "flat";
  }
}