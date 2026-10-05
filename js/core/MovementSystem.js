export const MovementSystem = {
  update(gameState, deltaSeconds, arenaSize) {
    for (const unit of gameState.units) {
      if (unit.isDead) continue;

      this.updateKnockback(unit, deltaSeconds, arenaSize);
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

      if (arenaSize) {
        this.clampUnitToArena(unit, arenaSize);
      }
    }

    this.resolveAllCollisions(gameState);
    
    if (arenaSize) {
      for (const unit of gameState.units) {
        if (!unit.isDead) {
          this.clampUnitToArena(unit, arenaSize);
        }
      }
    }
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

        if (a.knockbackState || b.knockbackState) {
          continue;
        }

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const minDistance = (a.hitboxRadius + b.hitboxRadius) * overlapTolerance;

        if (a.movementLockTimer > 0 || b.movementLockTimer > 0) {
          continue;
        }

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
    if (!target || target.isBuilding || target.isDead || target.isDestroyed) {
      return;
    }

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.sqrt(dx * dx + dy * dy) || 0.01;
    const nx = dx / length;
    const ny = dy / length;

    // apply knockbackResistance
    const resistance = target.knockbackResistance || 0
    const effectiveDistance = distance - resistance;

    if (effectiveDistance <= 0) {
      return;
    }

    target.knockbackState = {
      startX: target.x,
      startY: target.y,
      endX: target.x + nx * effectiveDistance,
      endY: target.y + ny * effectiveDistance,
      elapsed: 0,
      duration: 0.18
    };

    target.movementLockTimer = 0.18;
  },

  // déplacer progressivement l'unité qui est knockback
  updateKnockback(unit, deltaSeconds, arenaSize) {
    const state = unit.knockbackState;
    if (!state) return;

    state.elapsed += deltaSeconds;

    const progress = Math.min(state.elapsed / state.duration, 1);

    const easedProgress = 1 - Math.pow(1 - progress, 3);

    unit.x = state.startX + (state.endX - state.startX) * easedProgress;
    unit.y = state.startY + (state.endY - state.startY) * easedProgress;

    // on empêche l'unité de sortir de l'arène
    if (arenaSize) {
      this.clampUnitToArena(unit, arenaSize);
    }

    if (progress >= 1) {
      unit.knockbackState = null;
    }
  },

  // recoil
  pushBackFromTarget(unit, target, distance) {
    if (!unit || unit.isBuilding || unit.isDead) {
      return;
    }

    const dx = unit.x - target.x;
    const dy = unit.y - target.y;
    const length = Math.sqrt(dx * dx + dy * dy) || 0.01;
    const nx = dx / length;
    const ny = dy / length;
    const duration = unit.effects?.recoilDuration || 0.18;

    unit.knockbackState = {
      startX: unit.x,
      startY: unit.y,
      endX: unit.x + nx * distance,
      endY: unit.y + ny * distance,
      elapsed: 0,
      duration
    };

    unit.movementLockTimer = duration;
  },

  // helper pour empêcher les unités de sortir de l'arène
  clampUnitToArena(unit, arenaSize) {
    const margin = unit.hitboxRadius || 0;
    unit.x = Math.max(margin, Math.min(arenaSize.width - margin, unit.x));
    unit.y = Math.max(margin, Math.min(arenaSize.height - margin, unit.y));
  }
};