import { ItemEffectSystem } from "./ItemEffectSystem.js";

let unitIdCounter = 0;

export class Unit {
  constructor(definition, team, x, y, audioManager, playerProgress) {
    this.instanceId = `unit-${++unitIdCounter}`;
    this.definitionId = definition.id;
    this.name = definition.name;
    this.sprite = definition.sprite;
    this.renderScale = definition.renderScale ?? 1;

    this.isBuilding = false;
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
    this.knockbackResistance = definition.knockbackResistance ?? 0;
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

    // délai avant attaque après spawn
    this.spawnAttackDelay = definition.spawnAttackDelay ?? 0.2;
    // délai avant prochaine attaque
    this.attackCooldown = this.spawnAttackDelay;;

    this.target = null;
    this.isDead = false;

    // pour permettre le knockback (et animation smooth)
    this.knockbackState = null;
    this.movementLockTimer = 0;

    this.isFrozen = false;
    this.freezeTimer = 0;

    // effet ralentissement
    this.slowTimer = 0;
    this.slowAmount = 0;
    this.baseMovementSpeed = this.movementSpeed;
    this.slowAttackTimer = 0;
    this.slowAttackAmount = 0;
    this.baseAttackSpeed = this.attackSpeed;

    // explosion lors du spawn
    this.explodeOnSpawnArea = definition.explodeOnSpawnArea || 0;
    this.explodeOnSpawnDamage = definition.explodeOnSpawnDamage || 0;

    // MORT
    this.deathEffectTriggered = false;

    // explosion on death
    this.explodeOnDeathArea =  definition.explodeOnDeathArea || 0;
    this.explodeOnDeathDamage = definition.explodeOnDeathDamage || 0;

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

    return reducedDamage;
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
    this.updateStatusEffects(deltaSeconds);
  }

  applySlow(amount, duration) {
    this.slowAmount = Math.max(this.slowAmount, amount);
    this.slowTimer = Math.max(this.slowTimer, duration);
    this.movementSpeed = Math.max(0, this.baseMovementSpeed * (1 - this.slowAmount / 100));

    this.slowAttackAmount = Math.max(this.slowAttackAmount || 0, amount);
    this.slowAttackTimer = Math.max(this.slowAttackTimer || 0, duration);
    this.attackSpeed = Math.max(0.01, this.baseAttackSpeed * (1 - this.slowAttackAmount / 100));
  }

  // mise à jour des effets (freeze, slow)
  updateStatusEffects(deltaSeconds) {
    // freeze
    if (this.isFrozen) {
      this.freezeTimer -= deltaSeconds;

      if (this.freezeTimer <= 0) {
        this.isFrozen = false;
        this.freezeTimer = 0;
      }
    }

    // slow (movement)
    if (this.slowTimer > 0) {
      this.slowTimer -= deltaSeconds;

      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.slowAmount = 0;
        this.movementSpeed = this.baseMovementSpeed;
      }
    }
    // slow (attacks)
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