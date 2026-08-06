import { UnitDefinitions } from "../config/unitDefinitions.js";

const DEPLOYABLE_UNITS = [
  "chariot", "mat", "compacteur", "broyeur", "minipelle", "tombereau", "climatiseur", "brumisateur"
];

export const ChestSystem = {
  rollRarity(weights) {
    const roll = Math.random();
    let cumulative = 0;
    for (const rarity of Object.keys(weights)) {
      cumulative += weights[rarity];
      if (roll <= cumulative) return Number(rarity);
    }
    return 0;
  },

  pickUnitOfRarity(rarity, playerProgress) {
    const pool = DEPLOYABLE_UNITS
      .map((id) => UnitDefinitions[id])
      .filter((def) => def && def.rarity === rarity);

    if (pool.length === 0) return null;

    const unlockedIds = pool.filter((def) => !playerProgress.isUnlocked(def.id));
    const finalPool = unlockedIds.length > 0 ? unlockedIds : pool;

    return finalPool[Math.floor(Math.random() * finalPool.length)];
  },

  open(chestDefinition, playerProgress) {
    const rarity = this.rollRarity(chestDefinition.rarityWeights);
    let unit = this.pickUnitOfRarity(rarity, playerProgress);

    if (!unit) {
      for (const fallbackRarity of [0, 1, 2]) {
        unit = this.pickUnitOfRarity(fallbackRarity, playerProgress);
        if (unit) break;
      }
    }

    if (unit) playerProgress.unlockUnit(unit.id);

    return unit;
  }
};