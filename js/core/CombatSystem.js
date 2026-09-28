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

    gameState.removeDeadUnits();
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

  applyDamage(attacker, target, gameState) {
    if (this.isTargetInvalid(target)) return;

    if (typeof target.takeDamage === "function") {
      target.takeDamage(attacker.damage);
    }

    if (attacker.aoeRadius > 0) {
      this.applyAoeDamage(
        attacker,
        target,
        gameState
      );
    }
  },

  applyAoeDamage(attacker, primaryTarget, gameState) {
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
        entity.takeDamage(attacker.damage);
      }
    }
  },

  updateContinuousAttack(unit, gameState, deltaSeconds) {
    const target = unit.target;

    if (this.isTargetInvalid(target)) {
      unit.target = null;
      return;
    }

    const maxRange =
      unit.continuousAttack.maxRange ||
      unit.attackRange;

    const distance = unit.distanceTo(target);

    if (distance > maxRange) {
      unit.target = null;
      return;
    }

    if (!unit.continuousDamageAccumulator) {
      unit.continuousDamageAccumulator = 0;
    }

    unit.continuousDamageAccumulator +=
      unit.continuousAttack.damagePerSecond *
      deltaSeconds;

    const damage = Math.floor(
      unit.continuousDamageAccumulator
    );

    if (damage <= 0) return;

    unit.continuousDamageAccumulator -= damage;

    if (typeof target.takeDamage === "function") {
      target.takeDamage(damage);
    }

    if (unit.aoeRadius > 0) {
      this.applyAoeDamage(unit, target, gameState, damage);
    }
  }
};