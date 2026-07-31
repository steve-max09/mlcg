export const MovementSystem = {
  update(gameState, deltaSeconds) {
    for (const unit of gameState.units) {
      if (unit.isDead || !unit.canMove) continue;
      if (unit.target && unit.distanceTo(unit.target) <= unit.attackRange) {
        continue; // à portée, on n'avance plus
      }

      const target = this.findClosestTarget(unit, gameState);
      if (!target) continue;

      unit.target = target;
      this.moveToward(unit, target, deltaSeconds);
      this.resolveCollisions(unit, gameState);
    }
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

  resolveCollisions(unit, gameState) {
    for (const other of gameState.units) {
      if (other === unit || other.isDead) continue;

      const dx = unit.x - other.x;
      const dy = unit.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = unit.hitboxRadius + other.hitboxRadius;

      if (distance < minDistance && distance > 0) {
        const overlap = minDistance - distance;
        const pushX = (dx / distance) * overlap * 0.5;
        const pushY = (dy / distance) * overlap * 0.5;
        unit.x += pushX;
        unit.y += pushY;
        other.x -= pushX;
        other.y -= pushY;
      }
    }
  }
};