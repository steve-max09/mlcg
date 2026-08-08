export const CampaignLevels = [
  {
    id: 1,
    name: "Premiers travaux",
    description: "Détruisez la base ennemie.",
    objective: "destroyBase",
    map: "flat",
    unlockedByDefault: true,

    ai: {
      difficulty: 1,
      units: ["chauffage", "motobineuse"],
      startingEnergy: 5,
      spawnInterval: 4
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
    map: "middleWall",
    unlockedByDefault: false,

    waves: [
      {
        delay: 0,
        units: ["chauffage", "motobineuse"]
      },
      {
        delay: 12,
        units: ["compacteur"]
      },
      {
        delay: 25,
        units: ["broyeur", "compacteur"]
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
      difficulty: 2,
      units: ["chauffage", "compacteur", "broyeur"],
      startingEnergy: 8,
      spawnInterval: 3
    },

    reward: {
      yanga: 50,
      unlockUnit: "climatiseur"
    }
  }
];