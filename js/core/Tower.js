import { ItemEffectSystem } from "./ItemEffectSystem.js";

let towerIdCounter = 0;

export class Tower {
  constructor(definition, team, x, y) {
    this.instanceId = `tower-${++towerIdCounter}`;
    this.name = definition.name;
    this.sprite = definition.sprite;
    this.renderScale = definition.renderScale ?? 1;

    this.isBuilding = true;
    this.team = team;
    this.x = x;
    this.y = y;

    this.maxHp = definition.hp;
    this.hp = definition.hp;
    this.armor = definition.armor || 0;
    this.hitboxRadius = definition.hitboxRadius;

    this.damage = definition.damage || 0;
    this.attackSpeed = definition.attackSpeed || 1;
    this.attackRange = definition.attackRange || 0;
    this.targetType = definition.targetType || "any";

    this.canAttack = definition.canAttack !== false;
    this.canMove = false;

    // délai avant attaque après spawn
    this.spawnAttackDelay = definition.spawnAttackDelay ?? 0.2;
    // délai avant prochaine attaque
    this.attackCooldown = this.spawnAttackDelay;;

    this.target = null;

    // état frozen
    this.isFrozen = false;
    this.freezeTimer = 0;

    // état slow
    this.baseAttackSpeed = this.attackSpeed;
    this.slowAttackAmount = 0;
    this.slowAttackTimer = 0;

    this.isDestroyed = false;
    this.isDead = false;
    this.sounds = definition.sounds || {};
    this.projectile = definition.projectile || null;

    this.attackAnimation = definition.attackAnimation || "default";
    this.aoeRadius = definition.aoeRadius || 0;
    this.aoeCenter = definition.aoeCenter || "target";

    // effets spéciaux
    this.effects = ItemEffectSystem.getEffects(definition, null, team);
    this.passiveDamageAccumulator = 0;
    this.passiveHealAccumulator = 0;
  }

  takeDamage(amount) {
    const reducedDamage = Math.max(0, amount - this.armor);

    this.hp -= reducedDamage;

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDestroyed = true;
      this.isDead = true;
    }

    return reducedDamage;
  }

  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  applyFreeze(duration) {
    this.isFrozen = true;
    this.freezeTimer = Math.max(this.freezeTimer, duration);
  }

  applySlow(amount, duration) {
    this.slowAttackAmount = Math.max(this.slowAttackAmount, amount);
    this.slowAttackTimer = Math.max(this.slowAttackTimer, duration);
    this.attackSpeed = this.baseAttackSpeed * (1 - (this.slowAttackAmount * 2) / 100);
  }

  updateStatusEffects(deltaSeconds) {
    if (this.isFrozen) {
      this.freezeTimer -= deltaSeconds;

      if (this.freezeTimer <= 0) {
        this.isFrozen = false;
        this.freezeTimer = 0;
      }
    }

    if (this.slowAttackTimer > 0) {
      this.slowAttackTimer -= deltaSeconds;

      if (this.slowAttackTimer <= 0) {
        this.slowAttackTimer = 0;
        this.slowAttackAmount = 0;
        this.attackSpeed = this.baseAttackSpeed;
      }
    }
  }
}