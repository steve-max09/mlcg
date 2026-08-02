let unitIdCounter = 0;

export class Unit {
  constructor(definition, team, x, y) {
    this.instanceId = `unit-${++unitIdCounter}`;
    this.definitionId = definition.id;
    this.name = definition.name;
    this.sprite = definition.sprite;

    this.team = team; // "player" | "enemy"
    this.x = x;
    this.y = y;

    this.maxHp = definition.hp;
    this.hp = definition.hp;
    this.damage = definition.damage;
    this.attackSpeed = definition.attackSpeed;
    this.movementSpeed = definition.movementSpeed;
    this.attackRange = definition.attackRange;
    this.hitboxRadius = definition.hitboxRadius;
    this.targetType = definition.targetType || "any";
    this.canMove = definition.canMove !== false;
    this.canAttack = definition.canAttack !== false;

    this.passiveAbilities = definition.passiveAbilities || [];
    this.triggeredAbilities = definition.triggeredAbilities || [];
    this.attackAnimation = definition.attackAnimation || "default";
    this.attackAnimation = definition.attackAnimation || "default";
    this.aoeRadius = definition.aoeRadius || 0;
    this.aoeCenter = definition.aoeCenter || "target";

    this.attackCooldown = 0;
    this.target = null;
    this.isDead = false;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }
  }

  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}