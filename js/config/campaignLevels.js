export const CampaignLevels = [
  {
    id: 1,
    name: "Premiers travaux",
    description: "Détruisez la base ennemie.",
    objective: "destroyBase",
    map: "flat",
    unlockedByDefault: true,

    enemyStructures: {
      baseId: "base_usine",
      leftTowerId: "tower_standard",
      rightTowerId: "tower_standard"
    },

    ai: {
      unitPool: ["chauffage", "motobineuse"],
      startingEnergy: 0,
      decisionInterval: 4.5,
      energyRegenRate: 1,
      energyRegenInterval: 1700
    },

    reward: {
      yanga: 50,
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
    unlockedByDefault: true,

    waves: [
      {
        delay: 0,
        units: ["motobineuse", "motobineuse", "motobineuse"]
      },
      {
        delay: 10,
        units: ["motobineuse", "motobineuse", "chauffage", "motobineuse",]
      },
      {
        delay: 20,
        units: ["chauffage", "chauffage", "chauffage", "chauffage", "chauffage"],
      },
      {
        delay: 25,
        boss: "compacteur"
      }
    ],

    surviveDuration: 60,

    reward: {
      yanga: 50,
      unlockUnit: "compacteur"
    }
  },

  {
    id: 3,
    name: "Passage de la rivière",
    description: "Détruisez la base ennemie sur une nouvelle carte.",
    objective: "destroyBase",
    map: "river",
    unlockedByDefault: true,

    enemyStructures: {
      baseId: "base_barbie",
      leftTowerId: "tower_mega",
      rightTowerId: "tower_coalshot"
    },

    ai: {
      unitPool: ["chauffage", "compacteur"],
      startingEnergy: 0,
      decisionInterval: 2.5,
      energyRegenRate: 1,
      energyRegenInterval: 1700
    },

    reward: {
      yanga: 50,
      unlockUnit: "base_barbie"
    }
  },

  {
    id: 4,
    name: "Méfiance...",
    description: "Nos alliés discutentent.",
    objective: "dialog",
    map: "flat",
    unlockedByDefault: true,

    dialogs: [
      {
        character: "Le Loup",
        sprite: "assets/ui/loup.png",
        text: "Bien joué chef !"
      },
      {
        character: "Cheval de la sagesse",
        sprite: "assets/ui/horse.png",
        text: "Méfions-nous, nous voilà attaqués à nouveau ! Utilisez ces tours pour renforcer nos défenses !"
      },
      {
        character: "Le Loup",
        sprite: "assets/ui/loup.png",
        text: "Pas bête haha"
      }
    ],

    reward: {
      yanga: 10,
      unlockUnit: "tower_coalshot"
    }
  },

  {
    id: 5,
    name: "Le boss",
    description: "Éliminez le chef ennemi.",
    objective: "bossFight",
    map: "flat",
    unlockedByDefault: false,

    waves: [
      { delay: 0, units: ["compacteur", "compacteur"] },
      { delay: 5, units: ["compacteur"] },
      { delay: 10, boss: "chariot" }
    ],

    reward: {
      yanga: 100,
      chest: { chestId: "rare", quantity: 1 }
    }
  }


];