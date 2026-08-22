export const GeometryUtils = {
  circleIntersectsRect(x, y, radius, rect) {
    const closestX = Math.max(rect.x, Math.min(x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(y, rect.y + rect.height));
    const dx = x - closestX;
    const dy = y - closestY;

    return dx * dx + dy * dy < radius * radius;
  },

  circleIntersectsAnyRect(x, y, radius, obstacles) {
    return obstacles.some((obstacle) => this.circleIntersectsRect(x, y, radius, obstacle));
  },

  segmentIntersectsRect(x1, y1, x2, y2, rect) {
    if (this.pointInsideRect(x1, y1, rect) || this.pointInsideRect(x2, y2, rect)) return true;

    const edges = [
      [rect.x, rect.y, rect.x + rect.width, rect.y],
      [rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height],
      [rect.x + rect.width, rect.y + rect.height, rect.x, rect.y + rect.height],
      [rect.x, rect.y + rect.height, rect.x, rect.y]
    ];

    return edges.some(([x3, y3, x4, y4]) => this.segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4));
  },

  pointInsideRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  },

  segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denominator === 0) return false;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  },

  segmentIntersectsAnyRect(x1, y1, x2, y2, obstacles) {
    return obstacles.some((obstacle) => this.segmentIntersectsRect(x1, y1, x2, y2, obstacle));
  },

  hasLineOfSight(attacker, target, obstacles) {
    return !this.segmentIntersectsAnyRect(attacker.x, attacker.y, target.x, target.y, obstacles);
  },

  // retourne une position valide pour spawn des unités là où il n'y a pas d'obstacle
  findNearestValidPosition(x, y, radius, obstacles, bounds) {
    const margin = radius + 3;
    const clampedX = Math.max(margin, Math.min(x, bounds.width - margin));
    const clampedY = Math.max(margin, Math.min(y, bounds.height - margin));

    if (!this.circleIntersectsAnyRect(clampedX, clampedY, radius, obstacles)) {
        return { x: clampedX, y: clampedY };
    }

    const searchStep = Math.max(8, radius);
    const maxDistance = Math.max(bounds.width, bounds.height);

    for (let distance = searchStep; distance <= maxDistance; distance += searchStep) {
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const candidateX = clampedX + Math.cos(angle) * distance;
        const candidateY = clampedY + Math.sin(angle) * distance;

        const insideBounds = candidateX >= margin && candidateX <= bounds.width - margin && candidateY >= margin && candidateY <= bounds.height - margin;

        if (!insideBounds) continue;

        if (!this.circleIntersectsAnyRect(candidateX, candidateY, radius, obstacles)) {
            return { x: candidateX, y: candidateY };
        }
        }
    }

    return null;
    }
};