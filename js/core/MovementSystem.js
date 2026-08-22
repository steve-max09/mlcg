import { GeometryUtils } from "./GeometryUtils.js";

export const MovementSystem = {
  update(gameState, deltaSeconds) {
    for (const unit of gameState.units) {
      if (unit.isDead) continue;

      unit.updateFreeze(deltaSeconds);
      if (unit.isFrozen) continue;

      if (!unit.target || unit.target.isDead || unit.target.isDestroyed) {
        unit.target = null;
      }

      if (unit.canMove) {
        const inRange = unit.target && unit.distanceTo(unit.target) <= unit.attackRange;

        if (!inRange) {
          const target = this.findClosestTarget(unit, gameState);
          if (target) {
            unit.target = target;
            const navigationTarget = this.getNavigationTarget(unit, target, gameState);
            this.moveToward(unit, navigationTarget, deltaSeconds, gameState);
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
    const enemyTowers = gameState.getTowersOf(unit.team === "player" ? "enemy" : "player");
    const candidates = [...enemyUnits, ...enemyTowers];

    const strategicTarget = this.getStrategicTarget(unit, candidates, gameState);

    if (strategicTarget) {
      return strategicTarget;
    }

    const attackObstacles = gameState.mapGeometry?.attack || [];

    let closest = null;
    let closestDist = Infinity;

    for (const candidate of candidates) {
      const distance = unit.distanceTo(candidate);

      if (gameState.mapId === "river" && candidate.team !== unit.team) {
        const attackObstacles = gameState.mapGeometry?.attack || [];
        const blocked = GeometryUtils.segmentIntersectsAnyRect(unit.x, unit.y, candidate.x, candidate.y, attackObstacles);

        if (blocked && distance <= unit.attackRange) continue;
      }

      if (distance < closestDist) {
        closestDist = distance;
        closest = candidate;
      }
    }

    return closest;
  },

  moveToward(unit, target, deltaSeconds, gameState) {
    const dx = target.x - unit.x;
    const dy = target.y - unit.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const step = unit.movementSpeed * deltaSeconds;
    const nextX = unit.x + (dx / distance) * step;
    const nextY = unit.y + (dy / distance) * step;
    const collisionRadius = unit.hitboxRadius + 3;
    const obstacles = gameState.mapGeometry?.movement || [];

    if (!GeometryUtils.circleIntersectsAnyRect(nextX, nextY, collisionRadius, obstacles)) {
      unit.x = nextX;
      unit.y = nextY;
      return;
    }

    const canMoveX = !GeometryUtils.circleIntersectsAnyRect(nextX, unit.y, collisionRadius, obstacles);
    const canMoveY = !GeometryUtils.circleIntersectsAnyRect(unit.x, nextY, collisionRadius, obstacles);

    if (canMoveX) unit.x = nextX;
    if (canMoveY) unit.y = nextY;
  },

  resolveAllCollisions(gameState) {
    const units = gameState.units.filter((u) => !u.isDead);
    const pushFactor = 0.08;
    const overlapTolerance = 0.6;
    const obstacles = gameState.mapGeometry?.movement || [];

    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        const a = units[i];
        const b = units[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const minDistance = (a.hitboxRadius + b.hitboxRadius) * overlapTolerance;

        if (distance >= minDistance) continue;

        const overlap = minDistance - distance;
        const pushX = (dx / distance) * overlap * pushFactor;
        const pushY = (dy / distance) * overlap * pushFactor;

        const nextAX = a.x + pushX;
        const nextAY = a.y + pushY;
        const nextBX = b.x - pushX;
        const nextBY = b.y - pushY;

        const collisionRadiusA = a.hitboxRadius + 2;
        const collisionRadiusB = b.hitboxRadius + 2;

        const canMoveA = !GeometryUtils.circleIntersectsAnyRect(nextAX, nextAY, collisionRadiusA, obstacles);
        const canMoveB = !GeometryUtils.circleIntersectsAnyRect(nextBX, nextBY, collisionRadiusB, obstacles);

        if (canMoveA) {
          a.x = nextAX;
          a.y = nextAY;
        }

        if (canMoveB) {
          b.x = nextBX;
          b.y = nextBY;
        }
      }
    }
  },

  collidesWithObstacle(x, y, radius, obstacles) {
    return obstacles.some((obstacle) => {
      const closestX = Math.max(
        obstacle.x,
        Math.min(x, obstacle.x + obstacle.width)
      );

      const closestY = Math.max(
        obstacle.y,
        Math.min(y, obstacle.y + obstacle.height)
      );

      const dx = x - closestX;
      const dy = y - closestY;

      return dx * dx + dy * dy < radius * radius;
    });
  },

  getNavigationTarget(unit, target, gameState) {
    if (gameState.mapId === "middleWall") {
      return target;
    }

    const waypoints = gameState.mapWaypoints || [];
    const obstacles = gameState.mapGeometry?.movement || [];

    if (!waypoints.length) return target;

    const targetIsInAttackRange = unit.distanceTo(target) <= unit.attackRange;

    if (targetIsInAttackRange) return target;

    const directPathBlocked = GeometryUtils.segmentIntersectsAnyRect(unit.x, unit.y, target.x, target.y, obstacles);

    if (!directPathBlocked) return target;

    return this.findBestWaypoint(unit, target, waypoints, obstacles);
  },
  
  getStrategicTarget(unit, candidates, gameState) {
    const enemyTowers = gameState.getTowersOf(unit.team === "player" ? "enemy" : "player");
    
    const livingEnemyTowers = enemyTowers.filter((tower) => !tower.isDestroyed);
    const enemyBase = livingEnemyTowers.find((tower) => tower.isBase);

    if (gameState.mapId === "middleWall" && enemyBase) {
      const sideTowers = livingEnemyTowers.filter((tower) => !tower.isBase);

      if (sideTowers.length === 0) {
        return enemyBase;
      }
    }

    return null;
  }
};