import { UnitDefinitions } from "../config/unitDefinitions.js";
import { ItemDefinitions } from "../config/itemDefinitions.js";

// WARN: ne pas simplifier en cherchant toutes les unités du json, car certaines ne doivent pas être déblocables
// pour le joueur (en réalité il faut refactor pour chercher dans le json mais selon un critère à ajouter (ex: unlockable: true))
const DEPLOYABLE_UNITS = [
  "broyeur",
  "minipelle",
  "tombereau",
  "climatiseur",
  "brumisateur",
  "chariot",
  "mat",
  "araignee"
];

const UNIT_REWARD_CHANCE = 0.55;
const ITEM_REWARD_CHANCE = 0.45;

const ITEM_IDS = Object.keys(ItemDefinitions);

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
      .filter((def) => def && def.rarity === rarity && !playerProgress.isUnlocked(def.id));

    if (!pool.length) return null;

    return pool[Math.floor(Math.random() * pool.length)];
  },

  pickItemOfRarity(rarity) {
    const pool = Object.values(ItemDefinitions)
      .filter((item) => item.rarity === rarity);

    if (!pool.length) return null;

    return pool[
      Math.floor(Math.random() * pool.length)
    ];
  },

  open(chestDefinition, playerProgress) {
    const rarity = this.rollRarity(chestDefinition.rarityWeights);

    const unitPool = DEPLOYABLE_UNITS
      .map((id) => UnitDefinitions[id])
      .filter((def) =>
        def &&
        def.rarity === rarity &&
        !playerProgress.isUnlocked(def.id)
      );

    const itemPool = Object.values(ItemDefinitions).filter((item) => item.rarity === rarity);

    const canGiveUnit = unitPool.length > 0;
    const canGiveItem = itemPool.length > 0;

    if (!canGiveUnit && !canGiveItem) {
      return this.openFallbackReward(rarity, playerProgress);
    }

    const roll = Math.random();

    if (roll < UNIT_REWARD_CHANCE && canGiveUnit) {
      const unit = this.pickUnitOfRarity(rarity, playerProgress);

      playerProgress.unlockUnit(unit.id);

      return {
        type: "unit",
        definition: unit,
        quantity: 1
      };
    }

    if (canGiveItem) {
      const item = this.pickItemOfRarity(rarity);

      playerProgress.addItem(item.id, 1);

      return {
        type: "item",
        definition: item,
        quantity: 1
      };
    }

    const unit = this.pickUnitOfRarity(rarity, playerProgress);

    playerProgress.unlockUnit(unit.id);

    return {
      type: "unit",
      definition: unit,
      quantity: 1
    };
  },

  openFallbackReward(rarity, playerProgress) {
    const availableUnit = DEPLOYABLE_UNITS
      .map((id) => UnitDefinitions[id])
      .find((def) =>
        def &&
        !playerProgress.isUnlocked(def.id)
      );

    if (availableUnit) {
      playerProgress.unlockUnit(availableUnit.id);

      return {
        type: "unit",
        definition: availableUnit,
        quantity: 1
      };
    }

    const item = Object.values(ItemDefinitions)[0];

    if (!item) return null;

    playerProgress.addItem(item.id, 1);

    return {
      type: "item",
      definition: item,
      quantity: 1
    };
  }
};