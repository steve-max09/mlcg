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
    attackAnimation: "fireSpurt"
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
    attackAnimation: "spinSlash"
  },

  compacteur: {
    id: "compacteur",
    name: "Compacteur monocylindre Grand Travaux",
    sprite: "assets/loxams/Compacteur monocylindre Grand Travaux.png",
    cost: 5,
    hp: 1000,
    damage: 60,
    attackSpeed: 1,
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
    aoeCenter: "self"
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
    attackRange: 120,
    hitboxRadius: 22,
    targetType: "ground",
    canMove: true,
    canAttack: true,
    passiveAbilities: [],
    triggeredAbilities: [],
    attackAnimation: "grassSpurt"
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
    attackAnimation: "metalSlash"
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
    aoeCenter: "target"
  }
};