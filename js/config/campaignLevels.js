export const CampaignLevels = [
  {
    id: 1,
    name: "Salutations",
    description: "Bienvenue, chef.",
    objective: "dialog",
    map: "flat",
    unlockedByDefault: true,

    dialogs: [
      {
        character: "Le Loup",
        sprite: "assets/ui/loup.png",
        text: "Salut, chef! Content de vous revoir. Les Loxams rivaux ont établi une base juste en face de chez nous. Montrons-leur de quel bois on se chauffe!"
      }
    ]
  },

  {
    id: 2,
    name: "Défendre notre territoire",
    description: "Détruisez la base ennemie. Ces intrus n'ont rien à faire ici.",
    objective: "destroyBase",
    map: "flat",
    unlockedByDefault: false,

    enemyStructures: {
      baseId: "base_usine",
      leftTowerId: "tower_standard",
      rightTowerId: "tower_standard"
    },

    ai: {
      unitPool: ["chauffage", "motobineuse", "minipelle"],
      startingEnergy: 0,
      decisionInterval: 4.5,
      energyRegenRate: 1,
      energyRegenInterval: 1700
    },

    reward: {
      yanga: 50,
      chest: { chestId: "commonChest", quantity: 1 }
    }
  },

  {
    id: 3,
    name: "Renforts ennemis",
    description: "Ils ont mis la main sur un compacteur! Survivez aux vagues ennemies.",
    objective: "surviveWaves",
    map: "flat",
    unlockedByDefault: false,

    waves: [
      {
        delay: 0,
        units: ["motobineuse", "motobineuse", "motobineuse"]
      },
      {
        delay: 10,
        units: ["fendeuse", "chauffage"]
      },
      {
        delay: 15,
        boss: "compacteur"
      },
      {
        delay: 20,
        units: ["chauffage", "chauffage", "chauffage", "chauffage", "chauffage"],
      },
    ],

    surviveDuration: 60,

    reward: {
      yanga: 50,
      chest: { chestId: "commonChest", quantity: 1 },
      unlockUnit: "compacteur"
    }
  },

  {
    id: 4,
    name: "La Maison de Barbie",
    description: "Une autre base ennemie a été repérée. Attention aux tours electrisées!",
    objective: "destroyBase",
    map: "flat",
    unlockedByDefault: false,

    enemyStructures: {
      baseId: "base_barbie",
      leftTowerId: "tower_mega",
      rightTowerId: "tower_mega"
    },

    ai: {
      unitPool: ["chauffage", "compacteur", "fendeuse", "motobineuse", "chariot", "broyeur"],
      startingEnergy: 0,
      decisionInterval: 5,
      energyRegenRate: 1,
      energyRegenInterval: 1700
    },

    reward: {
      yanga: 150,
      unlockUnit: "base_barbie"
    }
  },

  {
    id: 5,
    name: "Méfiance...",
    description: "Nos alliés discutent.",
    objective: "dialog",
    spriteColor: "#ef4444",
    map: "flat",
    unlockedByDefault: false,

    dialogs: [
      {
        character: "Le Loup",
        sprite: "assets/ui/loup.png",
        text: "Bien joué chef!"
      },
      {
        character: "Cheval de la sagesse",
        sprite: "assets/ui/horse.png",
        text: "Méfions-nous, nous voilà attaqués à nouveau! Utilisez ces tours pour renforcer nos défenses!"
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
    id: 6,
    name: "Le tombereau maléfique",
    description: "Éliminez le tombereau ennemi qui menace notre base.",
    objective: "bossFight",
    map: "flat",
    unlockedByDefault: false,

    waves: [
      { delay: 0, units: ["compacteur", "compacteur", "compacteur"] },
      { delay: 15, units: ["chariot", "chariot"] },
      { delay: 17, boss: "tombereau" }
    ],

    reward: {
      yanga: 100,
      chest: { chestId: "rareChest", quantity: 1 }
    }
  }


];