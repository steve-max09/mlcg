import { AnimationSystem } from "./AnimationSystem.js";

export const AbilitySystem = {
  onSpawn(unit, gameState, options = {}) {
    const effects = unit.effects || {};

    if (effects.freezeOnSpawnArea) {
      this.applyFreezeArea(unit, gameState, effects.freezeOnSpawnArea, effects.freezeOnSpawnDuration || 2.5, options);
    }

    if (effects.slowOnSpawnArea) {
      this.applySlowArea(unit, gameState, effects.slowOnSpawnArea, effects.slowOnSpawnAmount || 20, effects.slowOnSpawnDuration || 2.5, options);
    }

    if (effects.explodeOnSpawnArea > 0 && effects.explodeOnSpawnDamage > 0) {
      this.applySpawnExplosion(unit, gameState, effects.explodeOnSpawnArea, effects.explodeOnSpawnDamage, options);
    }
  },

  applyFreezeArea(source, gameState, radius, duration, options = {}) {
    const enemies = this.getEnemiesInRadius(source, gameState, radius);

    for (const enemy of enemies) {
      if (typeof enemy.applyFreeze === "function") {
        enemy.applyFreeze(duration);
      }
    }

    AnimationSystem.playSpawnFreeze(options.arenaElement, source, radius);
  },

  applySlowArea(source, gameState, radius, amount, duration, options = {}) {
    const enemies = this.getEnemiesInRadius(source, gameState, radius);

    for (const enemy of enemies) {
      if (typeof enemy.applySlow === "function") {
        enemy.applySlow(amount, duration);
      }
    }

    AnimationSystem.playSlowArea(options.arenaElement, source, radius);
  },

  applySpawnExplosion(source, gameState, explodeOnSpawnArea, explodeOnSpawnDamage, options) {
    const explosionRadius = explodeOnSpawnArea;
    const explosionDamage = explodeOnSpawnDamage;

    options.audioManager.play(options.audioManager.uiSounds.rockdestroy);
    AnimationSystem.playSpawnExplosion(options.arenaElement, source, explosionRadius);
    AnimationSystem.playSpawnExplosionRing(options.arenaElement, source, explosionRadius);

    const enemies = this.getEnemiesInRadius(source, gameState, explosionRadius);

    for (const enemy of enemies) {
      if (enemy.isDead || enemy.isDestroyed) {
        continue;
      }

      const distance = source.distanceTo(enemy);

      if (distance <= explosionRadius) {
        enemy.takeDamage(explosionDamage);
      }
    }
  },

  getEnemiesInRadius(source, gameState, radius) {
    const enemyUnits =
      gameState.getEnemiesOf(source.team);

    const enemyTowers = gameState.getTowersOf(source.team === "player" ? "enemy" : "player");

    return [...enemyUnits, ...enemyTowers].filter((enemy) => {
      if (enemy.isDead || enemy.isDestroyed) {
        return false;
      }

      const dx = enemy.x - source.x;
      const dy = enemy.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance <= radius;
    });
  }
};