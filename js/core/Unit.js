import { ItemEffectSystem } from "./ItemEffectSystem.js";

let unitIdCounter = 0;

export class Unit {
  constructor(definition, team, x, y, audioManager, playerProgress) {
    this.instanceId = `unit-${++unitIdCounter}`;
    this.definitionId = definition.id;
    this.name = definition.name;
    this.sprite = definition.sprite;
    this.renderScale = definition.renderScale ?? 1;

    this.team = team; // "player" | "enemy"
    this.x = x;
    this.y = y;

    // déifinition des stats en appliquant les effets bonus des items
    this.playerProgress = playerProgress;
    this.effects = ItemEffectSystem.getEffects(definition, playerProgress, team);

    const stats = ItemEffectSystem.applyStatEffects(
      {
        maxHp: definition.hp,
        hp: definition.hp,
        armor: definition.armor,
        damage: definition.damage,
        attackSpeed: definition.attackSpeed,
        movementSpeed: definition.movementSpeed,
        attackRange: definition.attackRange,
        cost: definition.cost || 0,
        targetType: definition.targetType || "any"
      },
      this.effects
    );

    this.maxHp = stats.maxHp;
    this.hp = stats.hp;
    this.damage = stats.damage;
    this.armor = stats.armor || 0;
    this.attackSpeed = stats.attackSpeed;
    this.movementSpeed = stats.movementSpeed;
    this.attackRange = stats.attackRange;
    this.cost = stats.cost;
    this.targetType = stats.targetType;
    this.hitboxRadius = definition.hitboxRadius;
    this.canMove = definition.canMove !== false;
    this.canAttack = definition.canAttack !== false;

    this.passiveAbilities = definition.passiveAbilities || [];
    this.triggeredAbilities = definition.triggeredAbilities || [];
    this.attackAnimation = definition.attackAnimation || "default";
    this.attackAnimation = definition.attackAnimation || "default";
    this.aoeRadius = definition.aoeRadius || 0;
    this.aoeCenter = definition.aoeCenter || "target";

    this.audioManager = audioManager;
    this.sounds = definition.sounds || {};
    this.projectile = definition.projectile || null;
    // attaques continues (inferno)
    this.continuousAttack = definition.continuousAttack || null;

    this.attackCooldown = 0;
    this.target = null;
    this.isDead = false;

    // truc pour permettre le knockback
    this.movementLockTimer = 0;

    this.isFrozen = false;
    this.freezeTimer = 0;

    // attaques continues (inferno)
    this.lockedTarget = null;
    this.continuousDamageAccumulator = 0;

    // effets d'item
    this.playerProgress = playerProgress;
    this.itemEffects = {};

    // effets spéciaux
    this.passiveHealAccumulator = 0;
    this.passiveDamageAccumulator = 0;
    this.itemKillCount = 0;
  }

  takeDamage(amount) {
    const reducedDamage = Math.max(0, amount - this.armor);

    this.hp -= reducedDamage;

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

  // frozen
  applyFreeze(duration) {
    this.isFrozen = true;
    this.freezeTimer = Math.max(this.freezeTimer, duration);
  }

  updateFreeze(deltaSeconds) {
    if (!this.isFrozen) return;
    this.freezeTimer -= deltaSeconds;
    if (this.freezeTimer <= 0) {
      this.isFrozen = false;
      this.freezeTimer = 0;
    }
  }
}