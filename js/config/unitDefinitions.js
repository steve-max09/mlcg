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
    name: "Chauffage mobile fioul 50000 kcal",
    sprite: "assets/loxams/monto.png",
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
    hp: 250,
    damage: 25,
    attackSpeed: 1.4,
    movementSpeed: 70,
    attackRange: 30,
    hitboxRadius: 22,
    targetType: "ground",
    canMove: true,
    canAttack: true,
    passiveAbilities: [],
    triggeredAbilities: [],
    attackAnimation: "spinSlash"
  }
};