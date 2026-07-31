export const CombatSystem = {
  update(gameState, deltaSeconds, onAttack) {
    if (gameState.isGameOver) return;

    for (const unit of gameState.units) {
      if (unit.isDead || !unit.canAttack) continue;

      unit.attackCooldown = Math.max(0, unit.attackCooldown - deltaSeconds);

      if (!unit.target || unit.target.isDead || unit.target.isDestroyed) {
        continue;
      }

      const distance = unit.distanceTo(unit.target);
      if (distance <= unit.attackRange && unit.attackCooldown <= 0) {
        this.attack(unit, unit.target);
        unit.attackCooldown = 1 / unit.attackSpeed;
        if (onAttack) onAttack(unit, unit.target);
      }
    }

    gameState.removeDeadUnits();
    gameState.checkVictory();
  },

  attack(attacker, target) {
    if (typeof target.takeDamage === "function") {
      target.takeDamage(attacker.damage);
    }
  }
};