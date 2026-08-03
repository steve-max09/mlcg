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

    const playerTower = this.towers.find((t) => t.team === "player");
    const enemyTower = this.towers.find((t) => t.team === "enemy");

    if (playerTower && playerTower.isDestroyed) {
      this.isGameOver = true;
      this.winner = "enemy";
    } else if (enemyTower && enemyTower.isDestroyed) {
      this.isGameOver = true;
      this.winner = "player";
    }
  }

  reset() {
    this.units = [];
    this.towers = [];
    this.energy = 5;
    this.enemyEnergy = 5;
    this.isGameOver = false;
    this.winner = null;
  }
}