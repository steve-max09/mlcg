export const AbilitySystem = {
  onSpawn(unit, gameState, onEffect) {
    if (!unit.triggeredAbilities.includes("spawnFreeze")) return;

    const freezeRadius = unit.spawnFreezeRadius || 90;
    const freezeDuration = unit.spawnFreezeDuration || 2.5;

    const enemies = gameState.getEnemiesOf(unit.team);

    for (const enemy of enemies) {
      const dx = enemy.x - unit.x;
      const dy = enemy.y - unit.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= freezeRadius) {
        enemy.applyFreeze(freezeDuration);
      }
    }

    if (onEffect) onEffect(unit, freezeRadius);
  }
};