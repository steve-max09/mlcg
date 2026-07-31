import { isInsideRiver, getClosestBridgeX } from "../config/arenaLayout.js";

export const MovementSystem = {
  update(gameState, deltaSeconds, arenaSize) {
    for (const unit of gameState.units) {
      if (unit.isDead || !unit.canMove) continue;
      if (unit.target && unit.distanceTo(unit.target) <= unit.attackRange) {
        continue;
      }

      const target = this.findClosestTarget(unit, gameState);
      if (!target) continue;

      unit.target = target;
      this.moveToward(unit, target, deltaSeconds, arenaSize);
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

  getWaypoint(unit, target, arenaSize) {
    const unitInRiver = isInsideRiver(unit.y, arenaSize.height);
    const willCrossRiver =
      (unit.y < arenaSize.height * 0.5 && target.y > arenaSize.height * 0.5) ||
      (unit.y > arenaSize.height * 0.5 && target.y < arenaSize.height * 0.5);

    if (unitInRiver || willCrossRiver) {
      const bridgeX = getClosestBridgeX(unit.x, arenaSize.width);
      const needsBridgeAlignment = Math.abs(unit.x - bridgeX) > 20;
      if (needsBridgeAlignment) {
        return { x: bridgeX, y: unit.y };
      }
    }

    return { x: target.x, y: target.y };
  },

  moveToward(unit, target, deltaSeconds, arenaSize) {
    const waypoint = this.getWaypoint(unit, target, arenaSize);

    const dx = waypoint.x - unit.x;
    const dy = waypoint.y - unit.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return;

    const step = unit.movementSpeed * deltaSeconds;
    const nextX = unit.x + (dx / distance) * step;
    const nextY = unit.y + (dy / distance) * step;

    if (isInsideRiver(nextY, arenaSize.height)) {
      const bridgeX = getClosestBridgeX(unit.x, arenaSize.width);
      if (Math.abs(unit.x - bridgeX) > 20) {
        unit.x += Math.sign(bridgeX - unit.x) * step;
        return;
      }
    }

    unit.x = nextX;
    unit.y = nextY;
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