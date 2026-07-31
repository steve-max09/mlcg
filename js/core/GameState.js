export class GameState {
  constructor() {
    this.units = [];
    this.towers = [];
    this.energy = 5;
    this.maxEnergy = 10;
    this.energyRegenRate = 1;
    this.energyRegenInterval = 1800;
  }

  addUnit(unit) {
    this.units.push(unit);
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
}