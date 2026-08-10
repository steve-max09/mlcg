export const CampaignLevels = [
  {
    id: 1,
    name: "Premiers travaux",
    description: "Détruisez la base ennemie.",
    objective: "destroyBase",
    map: "flat",
    unlockedByDefault: true,

    ai: {
      unitPool: ["chauffage", "motobineuse"],
      startingEnergy: 0,
      decisionInterval: 4.5,
      energyRegenRate: 1,
      energyRegenInterval: 1700
    },

    reward: {
      yanga: 10,
      chest: {
        chestId: "common",
        quantity: 1
      }
    }
  },

  {
    id: 2,
    name: "Renforts industriels",
    description: "Survivez aux vagues ennemies.",
    objective: "surviveWaves",
    map: "river",
    unlockedByDefault: false,

    waves: [
      {
        delay: 0,
        units: ["chauffage", "motobineuse"]
      },
      {
        delay: 10,
        units: ["compacteur"]
      },
      {
        delay: 20,
        units: ["broyeur", "compacteur"],
        boss: "mat"
      }
    ],

    surviveDuration: 40,

    reward: {
      yanga: 30,
      unlockUnit: "compacteur"
    }
  },

  {
    id: 3,
    name: "Passage de la rivière",
    description: "Détruisez la base ennemie sur une nouvelle carte.",
    objective: "destroyBase",
    map: "river",
    unlockedByDefault: false,

    ai: {
      unitPool: ["chauffage", "compacteur"],
      startingEnergy: 0,
      decisionInterval: 2.5,
      energyRegenRate: 1,
      energyRegenInterval: 1700
    },

    reward: {
      yanga: 50,
      unlockUnit: "climatiseur"
    }
  }
];