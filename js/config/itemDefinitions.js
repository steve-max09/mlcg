export const ItemDefinitions = {
  gantsTitan: {
    id: "gantsTitan",
    name: "Gants manutention lourde TITAN 850",
    description: "Des gants renforcés pour les travaux difficiles.",
    sprite: "assets/items/gants-titan.png",
    rarity: 2,
    effects: {
      unitCostReduction: 1,
      attackSpeedBoost: 0.1,
      damageBoost: 40,
      movementSpeedBoost: 5,
      hpBoost: 10,
      armor: 10, // reduce incoming damage
    }
  },
  gantsEnduro: {
    id: "gantsEnduro",
    name: "Gants manutention lourde Enduro 328",
    description: "Excellente préhension avec adhérisation anti-dérapante.",
    sprite: "assets/items/gants-enduro.png",
    rarity: 1,
    effects: {
      hpBoost: 20,
      attackSpeedBoost: 0.2
    }
  },
  vitrificateur: {
    id: "vitrificateur",
    name: "Vitrificateur pur T3 extra mat 5L",
    description: "Vitrificateur monocomposant adapté aux forts trafics (lieux publics).",
    sprite: "assets/items/vitrificateur.png",
    rarity: 0,
    effects: {
      movementSpeedBoost: 5
    }
  },
  helicoidale: {
    id: "helicoidale",
    name: "Mêche hélicoidale pour tarière PF-403",
    description: "Pour creuser un max. Couteau d\’attaque interchangeable.",
    sprite: "assets/items/meche-helicoidale.png",
    rarity: 0,
    effects: {
      movementSpeedBoost: 5
    }
  }
};