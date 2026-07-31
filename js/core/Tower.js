let towerIdCounter = 0;

export class Tower {
  constructor(definition, team, x, y) {
    this.instanceId = `tower-${++towerIdCounter}`;
    this.name = definition.name;
    this.sprite = definition.sprite;

    this.team = team;
    this.x = x;
    this.y = y;

    this.maxHp = definition.hp;
    this.hp = definition.hp;
    this.hitboxRadius = definition.hitboxRadius;

    this.canAttack = false;
    this.canMove = false;
    this.isDestroyed = false;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDestroyed = true;
    }
  }

  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}