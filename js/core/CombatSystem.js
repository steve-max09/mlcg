import { MovementSystem } from "./MovementSystem.js";

export const CombatSystem = {
  update(gameState, deltaSeconds, onAttack) {
    if (gameState.isGameOver) return;

    for (const unit of gameState.units) {
      if (unit.isDead || !unit.canAttack) continue;
      if (unit.isFrozen) continue;

      // attaques continues (inferno)
      if (unit.continuousAttack) {
        if (!unit.target || this.isTargetInvalid(unit.target)
          || unit.distanceTo(unit.target) > (unit.continuousAttack.maxRange || unit.attackRange)) {
          unit.target = MovementSystem.findClosestTarget(unit, gameState);
        }

        this.updateContinuousAttack(unit, gameState, deltaSeconds);

        continue;
      }

      unit.attackCooldown = Math.max(0, unit.attackCooldown - deltaSeconds);

      if (this.isTargetInvalid(unit.target)) {
        unit.target = null;
        continue;
      }

      const distance = unit.distanceTo(unit.target);
      if (distance <= unit.attackRange && unit.attackCooldown <= 0) {
        const attackResult = this.createAttack(unit, unit.target, gameState);

        unit.attackCooldown = 1 / unit.attackSpeed;

        if (onAttack) {
          onAttack(unit, unit.target, attackResult);
        }

        if (this.isTargetInvalid(unit.target)) {
          unit.target = null;
        }
      }
    }

    for (const tower of gameState.towers) {
      if (tower.isDead || !tower.canAttack) continue;
      if (tower.isFrozen) continue;

      if (tower.continuousAttack) {
        if (!tower.target || this.isTargetInvalid(tower.target)
          || tower.distanceTo(tower.target) > (tower.continuousAttack.maxRange || tower.attackRange)) {
          tower.target = this.findClosestTargetInRange(tower, gameState);
        }
        
        this.updateContinuousAttack(tower, gameState, deltaSeconds);

        continue;
      }

      tower.attackCooldown = Math.max(0, tower.attackCooldown - deltaSeconds);

      const target = this.findClosestTargetInRange(tower, gameState);
      if (!target) continue;

      if (tower.attackCooldown <= 0) {
        const attackResult = this.createAttack(tower, target, gameState);

        tower.attackCooldown = 1 / tower.attackSpeed;

        if (onAttack) {
          onAttack(tower, target, attackResult);
        }
      }
    }

    gameState.checkVictory();
  },

  // permet aux tours / bases de trouver leurs targets
  findClosestTargetInRange(attacker, gameState) {
    const enemies = gameState.getEnemiesOf(attacker.team);
    let closest = null;
    let closestDist = Infinity;

    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      const dist = attacker.distanceTo(enemy);
      if (dist <= attacker.attackRange && dist < closestDist) {
        closestDist = dist;
        closest = enemy;
      }
    }

    return closest;
  },

  isTargetInvalid(target) {
    if (!target) return true;
    if (target.isDead) return true;
    if (target.isDestroyed) return true;
    return false;
  },

  createAttack(attacker, target, gameState) {
    const isProjectileAttack = Boolean(attacker.projectile);

    if (attacker.effects.recoil) {
      this.applyRecoil(attacker, target);
    }

    if (isProjectileAttack) {
      return {
        delayed: true,
        apply: () => {
          if (this.isTargetInvalid(target)) return;

          this.applyDamage(attacker, target, gameState);
        }
      };
    }

    this.applyDamage(attacker, target, gameState);

    return { delayed: false, apply: null };
  },

  applyDamage(attacker, target, gameState, damage = attacker.damage) {
    if (this.isTargetInvalid(target)) {
      return 0;
    }

    const dealtDamage = typeof target.takeDamage === "function" ? target.takeDamage(damage) : 0;

    if (dealtDamage > 0) {
      this.applyTargetControlEffects(attacker, target);
    }

    if (!target.isBuilding && attacker.effects?.knockback > 0 && !target.isDead && !target.isDestroyed) {
      MovementSystem.pushAwayFrom(attacker, target, attacker.effects.knockback);
    }

    if (dealtDamage > 0 && attacker.effects?.lifesteal) {
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + attacker.effects.lifesteal);
    }

    if (attacker.aoeRadius > 0) {
      this.applyAoeDamage(attacker, target, gameState, damage);
    }

    return dealtDamage;
  },

  applyAoeDamage(attacker, primaryTarget, gameState, damage = attacker.damage) {
    const center =
      attacker.aoeCenter === "self"
        ? { x: attacker.x, y: attacker.y }
        : { x: primaryTarget.x, y: primaryTarget.y };

    const enemyUnits = gameState.getEnemiesOf(attacker.team);
    const enemyTowers = gameState.getTowersOf(
      attacker.team === "player" ? "enemy" : "player"
    );
    const affectable = [...enemyUnits, ...enemyTowers];

    for (const entity of affectable) {
      if (entity === primaryTarget) continue;

      const dx = entity.x - center.x;
      const dy = entity.y - center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= attacker.aoeRadius && typeof entity.takeDamage === "function") {
        const dmg = entity.takeDamage(damage);
        if (dmg > 0) {
          this.applyTargetControlEffects(attacker, entity);
        }
      }
    }
  },

  updateContinuousAttack(unit, gameState, deltaSeconds) {
    const target = unit.target;

    if (this.isTargetInvalid(target)) {
      unit.target = null;
      return;
    }

    const maxRange = unit.continuousAttack.maxRange || unit.attackRange;

    const distance = unit.distanceTo(target);

    if (distance > maxRange) {
      unit.target = null;
      return;
    }

    if (!unit.continuousDamageAccumulator) {
      unit.continuousDamageAccumulator = 0;
    }

    const continuousDamage = unit.continuousAttack.damagePerSecond + (unit.effects?.damageBoost || 0);
    unit.continuousDamageAccumulator += continuousDamage * deltaSeconds;

    const damage = Math.floor(
      unit.continuousDamageAccumulator
    );

    if (damage <= 0) return;

    unit.continuousDamageAccumulator -= damage;

    this.applyDamage(unit, target, gameState, damage);
  },

  applyRecoil(attacker, target) {
    const distance = attacker.effects?.recoil || 0;

    if (distance <= 0 || attacker.isDead || attacker.isBuilding) return;

    MovementSystem.pushBackFromTarget(attacker, target, distance);
  },

  // effets freeze / slow
  applyTargetControlEffects(attacker, target) {
    const effects = attacker.effects || {};

    if (effects.freezeTargetsDuration && typeof target.applyFreeze === "function") {
      target.applyFreeze(effects.freezeTargetsDuration);
    }

    if (effects.slowTargetsAmount && effects.slowTargetsDuration && typeof target.applySlow === "function") {
      target.applySlow(effects.slowTargetsAmount, effects.slowTargetsDuration);
    }
  }
};