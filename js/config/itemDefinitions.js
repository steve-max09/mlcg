export const ItemDefinitions = {
  gantsTitan: {
    id: "gantsTitan",
    name: "Gants manutention lourde TITAN 850",
    description: "Des gants renforcés pour les travaux difficiles.",
    sprite: "assets/items/gants-titan.png",
    rarity: 1,
    effects: {
      armor: 5,
      attackSpeedBoost: 0.1,
    }
  },
  gantsEnduro: {
    id: "gantsEnduro",
    name: "Gants manutention lourde Enduro 328",
    description: "Excellente préhension avec adhérisation anti-dérapante.",
    sprite: "assets/items/gants-enduro.png",
    rarity: 0,
    effects: {
      unitCostIncrease: 1,
      movementSpeedBoost: 10,
      damageBoost: 23
    }
  },
  vitrificateur: {
    id: "vitrificateur",
    name: "Vitrificateur pur T3 extra mat 5L",
    description: "Vitrificateur monocomposant adapté aux forts trafics (lieux publics).",
    sprite: "assets/items/vitrificateur.png",
    rarity: 0,
    effects: {
      unitCostReduction: 2
    }
  },
  helicoidale: {
    id: "helicoidale",
    name: "Mêche hélicoidale pour tarière PF-403",
    description: "Mêche avec couteau d\’attaque interchangeable pour creuser à travers les défenses ennemies.",
    sprite: "assets/items/meche-helicoidale.png",
    rarity: 0,
    effects: {
      targetTypeChange: "buildings",
      damageBoost: 100
    }
  },
  electrogene: {
    id: "electrogene",
    name: "Groupe électrogène EXPERT 4010X",
    description: "Robuste et puissant. Conçu pour un usage intensif.",
    sprite: "assets/items/grp-electro.png",
    rarity: 2,
    effects: {
      passiveDamage: 70,
      passiveDamageArea: 60,
      passiveDamageTick: 0.8
    }
  },
  molette: {
    id: "molette",
    name: "Clé à molette grande ouverture 8”",
    description: "Pour desserrer et serrer les raccords à vis jusqu'à 39 mm.",
    sprite: "assets/items/molette.png",
    rarity: 0,
    effects: {
      passiveHeal: 10
    }
  },
  conservateur: {
    id: "conservateur",
    name: "Conservateur ROPULS 6x1L",
    description: "Permet de protéger les systèmes après nettoyage.",
    sprite: "assets/items/conservateur.png",
    rarity: 0,
    effects: {
      hpBoost: 130,
      lifesteal: 20
    }
  },
  disque: {
    id: "disque",
    name: "Disque diamant pour scie de sol et découpeuse thermique",
    description: "Utilisation : à sec/à eau. Augmente considérablement les dégâts.",
    sprite: "assets/items/disque.png",
    rarity: 0,
    effects: {
      attackSpeedBoost: 0.6,
      damageBoost: 50
    }
  },
  eponge: {
    id: "eponge",
    name: "Éponge cimentier grise",
    description: "Une éponge en mousse polyuréthane pour rester propre en détruisant les unités ennemies.",
    sprite: "assets/items/eponge.png",
    rarity: 0,
    effects: {
      targetTypeChange: "ground",
      passiveHeal: 15
    }
  },
  aspirateur: {
    id: "aspirateur",
    name: "Aspirateur eau et poussières",
    description: "Cuve structofoam - NUMATIC - WVD1800DH-2 avec entonnoir obturateur et suceur.",
    sprite: "assets/items/aspirateur.png",
    rarity: 1,
    effects: {
      lifesteal: 30
    }
  },
  pic: {
    id: "pic",
    name: "Pic pour démolition thermique et pneumatique",
    description: "Un pic à emmanchement hexagonal 19 x 50 mm, idéal pour faire de gros dégâts de démolition.",
    sprite: "assets/items/pic.png",
    rarity: 1,
    effects: {
      explodeOnSpawnDamage: 80,
      explodeOnSpawnArea: 120
    }
  }
};
