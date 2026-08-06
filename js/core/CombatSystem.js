export const CombatSystem = {
  update(gameState, deltaSeconds, onAttack) {
    if (gameState.isGameOver) return;

    for (const unit of gameState.units) {
      if (unit.isDead || !unit.canAttack) continue;
      if (unit.isFrozen) continue;

      unit.attackCooldown = Math.max(0, unit.attackCooldown - deltaSeconds);

      if (this.isTargetInvalid(unit.target)) {
        unit.target = null;
        continue;
      }

      const distance = unit.distanceTo(unit.target);
      if (distance <= unit.attackRange && unit.attackCooldown <= 0) {
        this.attack(unit, unit.target, gameState);
        unit.attackCooldown = 1 / unit.attackSpeed;
        if (onAttack) onAttack(unit, unit.target);

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
        this.attack(tower, target, gameState);
        tower.attackCooldown = 1 / tower.attackSpeed;
        if (onAttack) onAttack(tower, target);
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

  attack(attacker, target, gameState) {
    if (typeof target.takeDamage === "function") {
      target.takeDamage(attacker.damage);
    }

    if (attacker.aoeRadius > 0) {
      this.applyAoeDamage(attacker, target, gameState);
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
  }
};