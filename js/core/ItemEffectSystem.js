import { ItemDefinitions } from "../config/itemDefinitions.js";

export const ItemEffectSystem = {
  getEffects(definition, playerProgress, team) {
    const effects = {...(definition.effects || {})};

    if (team !== "player" || !playerProgress) {
      return effects;
    }

    const equippedItemId = playerProgress.getEquippedItem(definition.id);

    if (!equippedItemId) {
      return effects;
    }

    const item = ItemDefinitions[equippedItemId];

    if (!item?.effects) {
      return effects;
    }

    for (const [key, value] of Object.entries(item.effects)) {
      if (typeof value !== "number") {
        effects[key] = value;
        continue;
      }

      effects[key] = (effects[key] || 0) + value;
    }

    return effects;
  },

  applyStatEffects(baseStats, effects) {
    const stats = {...baseStats};

    if (effects.hpBoost) {
      stats.maxHp += effects.hpBoost;
      stats.hp += effects.hpBoost;
    }

    if (effects.armor) {
      stats.armor += effects.armor;
    }

    if (effects.damageBoost) {
      stats.damage += effects.damageBoost;
    }

    if (effects.attackSpeedBoost) {
      stats.attackSpeed += effects.attackSpeedBoost;
    }

    if (effects.movementSpeedBoost) {
      stats.movementSpeed += effects.movementSpeedBoost;
    }

    if (effects.attackRangeBoost) {
      stats.attackRange += effects.attackRangeBoost;
    }

    if (effects.unitCostReduction) {
      stats.cost = Math.max(0, stats.cost - effects.unitCostReduction);
    }

    if (effects.unitCostIncrease) {
      stats.cost += effects.unitCostIncrease;
    }

    if (effects.targetTypeChange) {
      stats.targetType = effects.targetTypeChange;
    }

    return stats;
  },

  getUnitCost(definition, playerProgress) {
    let cost = definition.cost || 0;

    if (!playerProgress || definition.category !== "unit") {
        return cost;
    }

    const itemId = playerProgress.getEquippedItem(definition.id);

    const item = itemId
        ? ItemDefinitions[itemId]
        : null;

    const effects = {
        ...(definition.effects || {}),
        ...(item?.effects || {})
    };

    cost -= effects.unitCostReduction || 0;
    cost += effects.unitCostIncrease || 0;

    return Math.max(2, cost);
    }
};