export const MovementSystem = {
  update(gameState, deltaSeconds) {
    for (const unit of gameState.units) {
      if (unit.isDead) continue;

      unit.updateFreeze(deltaSeconds);

      unit.movementLockTimer = Math.max(0, unit.movementLockTimer - deltaSeconds);

      if (unit.isFrozen) continue;

      if (unit.movementLockTimer > 0) continue;

      // attaques continues (inferno)
      if (unit.continuousAttack) {
        if (!unit.target || unit.target.isDead || unit.distanceTo(unit.target) > (unit.continuousAttack.maxRange || unit.attackRange)) {
          unit.target = this.findClosestTarget(unit, gameState);
        }
      } else {
        unit.target = this.findClosestTarget(unit, gameState);
      }

      if (unit.canMove) {
        const unitAttackRange = unit.continuousAttack?.maxRange || unit.attackRange;
        const inRange = unit.target && unit.distanceTo(unit.target) <= unitAttackRange;

        if (!inRange) {
          const target = this.findClosestTarget(unit, gameState);
          if (target) {
            unit.target = target;
            this.moveToward(unit, target, deltaSeconds);
          }
        }

      } else {
        // l'unité ne peut pas bouger mais on lui cherche quand même une cible
        const targetInRange = unit.target && unit.distanceTo(unit.target) <= unit.attackRange && !unit.target.isDead;

        if (!targetInRange) {
          unit.target = this.findClosestTarget(unit, gameState);
        }
      }
    }

    this.resolveAllCollisions(gameState);
  },

  findClosestTarget(unit, gameState) {
    const candidates = this.getTargetCandidates(
      unit,
      gameState
    );

    let closest = null;
    let closestDist = Infinity;

    for (const candidate of candidates) {
      const dist = unit.distanceTo(candidate);

      if (dist < closestDist) {
        closestDist = dist;
        closest = candidate;
      }
    }

    return closest;
  },

  getTargetCandidates(unit, gameState) {
    const enemyUnits = gameState.getEnemiesOf(unit.team);
    const enemyTowers = gameState.getTowersOf(
      unit.team === "player" ? "enemy" : "player"
    );

    const targetType = unit.targetType || "any";

    if (targetType === "buildings") {
      return enemyTowers;
    }

    if (targetType === "ground") {
      return enemyUnits;
    }

    return [
      ...enemyUnits,
      ...enemyTowers
    ];
  },

  moveToward(unit, target, deltaSeconds) {
    const dx = target.x - unit.x;
    const dy = target.y - unit.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return;

    const step = unit.movementSpeed * deltaSeconds;
    unit.x += (dx / distance) * step;
    unit.y += (dy / distance) * step;
  },

  resolveAllCollisions(gameState) {
    const units = gameState.units.filter((u) => !u.isDead);
    const pushFactor = 0.15;
    const overlapTolerance = 0.6;

    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        const a = units[i];
        const b = units[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const minDistance = (a.hitboxRadius + b.hitboxRadius) * overlapTolerance;

        if (distance < minDistance) {
          const overlap = minDistance - distance;
          const pushX = (dx / distance) * overlap * pushFactor;
          const pushY = (dy / distance) * overlap * pushFactor;
          a.x += pushX;
          a.y += pushY;
          b.x -= pushX;
          b.y -= pushY;
        }
      }
    }
  },

  // knockback
  pushAwayFrom(source, target, distance) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.sqrt(dx * dx + dy * dy) || 0.01;
    const nx = dx / length;
    const ny = dy / length;

    target.x += nx * distance;
    target.y += ny * distance;
    target.movementLockTimer = 0.15;
  },

  // recoil
  pushBackFromTarget(unit, target, distance) {
    const dx = unit.x - target.x;
    const dy = unit.y - target.y;
    const length = Math.sqrt(dx * dx + dy * dy) || 0.01;
    const nx = dx / length;
    const ny = dy / length;

    unit.x += nx * distance;
    unit.y += ny * distance;
    unit.movementLockTimer = 0.15;
  }
};