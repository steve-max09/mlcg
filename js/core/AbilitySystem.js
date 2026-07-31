const passiveHandlers = {
  ranged: () => {}
};

const triggeredHandlers = {};

export const AbilitySystem = {
  applyPassives(unit) {
    for (const ability of unit.passiveAbilities) {
      const handler = passiveHandlers[ability];
      if (handler) handler(unit);
    }
  },

  triggerOnDeath(unit, gameState) {
    for (const ability of unit.triggeredAbilities) {
      const handler = triggeredHandlers[ability];
      if (handler) handler(unit, gameState);
    }
  }
};