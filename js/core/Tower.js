let towerIdCounter = 0;

export class Tower {
  constructor(definition, team, x, y) {
    this.isBase = false;
    this.instanceId = `tower-${++towerIdCounter}`;
    this.name = definition.name;
    this.sprite = definition.sprite;

    this.team = team;
    this.x = x;
    this.y = y;

    this.maxHp = definition.hp;
    this.hp = definition.hp;
    this.hitboxRadius = definition.hitboxRadius;

    this.damage = definition.damage || 0;
    this.attackSpeed = definition.attackSpeed || 1;
    this.attackRange = definition.attackRange || 0;
    this.targetType = definition.targetType || "any";

    this.canAttack = definition.canAttack !== false;
    this.canMove = false;

    this.attackCooldown = 0;
    this.target = null;

    this.isDestroyed = false;
    this.isDead = false;
    this.sounds = definition.sounds || {};

    this.attackAnimation = definition.attackAnimation || "default";
    this.aoeRadius = definition.aoeRadius || 0;
    this.aoeCenter = definition.aoeCenter || "target";
    this.sounds = definition.sounds || {};
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDestroyed = true;
      this.isDead = true;
    }
  }

  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}