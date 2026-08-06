export const MovementSystem = {
  update(gameState, deltaSeconds) {
    for (const unit of gameState.units) {
      if (unit.isDead) continue;

      unit.updateFreeze(deltaSeconds);
      if (unit.isFrozen) continue;

      if (unit.canMove) {
        const inRange = unit.target && unit.distanceTo(unit.target) <= unit.attackRange;

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
    const enemyUnits = gameState.getEnemiesOf(unit.team);
    const enemyTowers = gameState.getTowersOf(
      unit.team === "player" ? "enemy" : "player"
    );
    const candidates = [...enemyUnits, ...enemyTowers];

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
  }
};