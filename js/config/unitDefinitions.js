// bases
export const TowerDefinition = {
  id: "mainBase",
  name: "Base principale",
  sprite: "assets/bases/usine.png",
  hp: 2000,
  hitboxRadius: 60,
  canAttack: false,
  canMove: false
};

// stats de chaque unité
export const UnitDefinitions = {
  chauffage: {
    id: "chauffage",
    name: "Chauffage mobile fioul 50000 kcal/h",
    sprite: "assets/loxams/Chauffage mobile fioul 50 000 kcal.png",
    cost: 3,
    hp: 400,
    damage: 20,
    attackSpeed: 1.2,
    movementSpeed: 60,
    attackRange: 150,
    hitboxRadius: 26,
    targetType: "buildings",
    canMove: true,
    canAttack: true,
    passiveAbilities: [],
    triggeredAbilities: [],
    attackAnimation: "fireSpurt",
    sounds: {
      spawn: "assets/sounds/units/chauffage-spawn.mp3",
      attack: "assets/sounds/units/chauffage-attack.mp3",
      death: "assets/sounds/units/chauffage-death.mp3"
    }
  },

  motobineuse: {
    id: "motobineuse",
    name: "Motobineuse",
    sprite: "assets/loxams/Motobineuse.png",
    cost: 2,
    hp: 280,
    damage: 20,
    attackSpeed: 1.5,
    movementSpeed: 70,
    attackRange: 30,
    hitboxRadius: 22,
    targetType: "ground",
    canMove: true,
    canAttack: true,
    passiveAbilities: [],
    triggeredAbilities: [],
    attackAnimation: "spinSlash",
    sounds: {
      spawn: "assets/sounds/units/chauffage-spawn.mp3",
      attack: "assets/sounds/units/motobineuse-attack.mp3",
      death: "assets/sounds/units/motobineuse-death.mp3"
    }
  },

  compacteur: {
    id: "compacteur",
    name: "Compacteur monocylindre Grand Travaux",
    sprite: "assets/loxams/Compacteur monocylindre Grand Travaux.png",
    cost: 5,
    hp: 1000,
    damage: 60,
    attackSpeed: 0.7,
    movementSpeed: 30,
    attackRange: 50,
    hitboxRadius: 26,
    targetType: "ground",
    canMove: true,
    canAttack: true,
    passiveAbilities: [],
    triggeredAbilities: [],
    attackAnimation: "groundSmash",
    aoeRadius: 70,
    aoeCenter: "self",
    sounds: {
      spawn: "assets/sounds/units/chauffage-spawn.mp3",
      attack: "assets/sounds/units/compacteur-attack.mp3",
      death: "assets/sounds/units/chauffage-death.mp3"
    }
  },

  broyeur: {
    id: "broyeur",
    name: "Broyeur de végétaux",
    sprite: "assets/loxams/Broyeur de végétaux.png",
    cost: 4,
    hp: 200,
    damage: 100,
    attackSpeed: 0.5,
    movementSpeed: 50,
    attackRange: 180,
    hitboxRadius: 22,
    targetType: "ground",
    canMove: true,
    canAttack: true,
    passiveAbilities: [],
    triggeredAbilities: [],
    attackAnimation: "grassSpurt",
    sounds: {
      spawn: "assets/sounds/units/chauffage-spawn.mp3",
      attack: "assets/sounds/units/broyeur-attack.mp3",
      death: "assets/sounds/units/chauffage-death.mp3"
    }
  },

  minipelle: {
    id: "minipelle",
    name: "Minipelle sur chenilles",
    sprite: "assets/loxams/Minipelle sur chenilles.png",
    cost: 4,
    hp: 300,
    damage: 100,
    attackSpeed: 1,
    movementSpeed: 80,
    attackRange: 50,
    hitboxRadius: 22,
    targetType: "ground",
    canMove: true,
    canAttack: true,
    passiveAbilities: [],
    triggeredAbilities: [],
    attackAnimation: "metalSlash",
    sounds: {
      spawn: "assets/sounds/units/chauffage-spawn.mp3",
      attack: "assets/sounds/units/minipelle-attack.mp3",
      death: "assets/sounds/units/chauffage-death.mp3"
    }
  },
  
  tombereau: {
    id: "tombereau",
    name: "Tombereau articulé",
    sprite: "assets/loxams/Tombereau articulé.png",
    cost: 6,
    hp: 800,
    damage: 70,
    attackSpeed: 0.8,
    movementSpeed: 30,
    attackRange: 180,
    hitboxRadius: 22,
    targetType: "ground",
    canMove: true,
    canAttack: true,
    passiveAbilities: [],
    triggeredAbilities: [],
    attackAnimation: "coalShot",
    aoeRadius: 60,
    aoeCenter: "target",
    sounds: {
      spawn: "assets/sounds/units/chauffage-spawn.mp3",
      attack: "assets/sounds/units/tombereau-attack.mp3",
      death: "assets/sounds/units/chauffage-death.mp3"
    }
  }
};