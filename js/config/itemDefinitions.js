export const ItemDefinitions = {
  gantsTitan: {
    id: "gantsTitan",
    name: "Gants manutention lourde TITAN 850",
    description: "Des gants renforcés pour les travaux difficiles.",
    sprite: "assets/items/gants-titan.png",
    rarity: 2,
    effects: {
      // à harmoniser avec les systèmes déjà en place pour pouvoir mettre ces effets sur les unités de base aussi (dans UnitDefinitions.js)
      // et utiliser toujours la même animation de freeze, ajouter un effet pour "explode", pour "passiveDamage" et pour "armor"
      unitCostReduction: 1,
      unitCostIncrease: 1,
      attackSpeedBoost: 0.1,
      damageBoost: 10,
      movementSpeedBoost: 5,
      hpBoost: 10,
      armor: 10, // reduce incoming damage
      temporaryArmorOnSpawn: 100,
      temporaryArmorOnSpawnDuration: 3.5,
      temporaryArmorForTowersOnSpawn: 100,
      temporaryArmorForTowersOnSpawnDuration: 3.5,
      passiveHeal: 5, // heal self every second
      lifesteal: 5, // heal this amount after each successful attack
      passiveDamageArea: 40, // damage ennemies in radius
      passiveDamageTick: 1, // ?
      passiveDamage: 5,
      knockback: 30, // push target backwards if it survives
      recoil: 30, // bounce backwards after each attack
      freezeTargetsDuration: 1.5,
      slowTargetsDuration: 1.5,
      slowTargetsAmount: 10,
      targetTypeChange: "buildings",
      explodeOnDeathArea: 80,
      explodeOnDeathDamage: 50,
      freezeOnDeathArea: 40,
      freezeOnDeathDuration: 3.5,
      summonUnitOnDeath: "motobineuse",
      summonUnitOnDeathAmount: 3,
      summonUnitOnKill: "motobineuse",
      explodeOnSpawnArea: 80,
      explodeOnSpawnDamage: 50,
      freezeOnSpawnArea: 40,
      freezeOnSpawnDuration: 3.5,
      summonUnitOnSpawn: "motobineuse",
      summonUnitOnSpawnAmount: 3,
      summonRowOfUnitsInTheBack: "motobineuse", // summon a row of 7 units at your end of the arena
      summonProjectilesInTheBack: { // projectiles that shoot forwards from your side of the arena
        type: "scrapProjectile",
        amount: 7,
        travelDuration: {
          min: 220,
          max: 800,
          pixelsPerMillisecond: 4.2
        },
        impact: {
          spriteSheet: {
            image: "assets/effects/scrap-impact.png",
            frameWidth: 128, frameHeight: 129, frameCount: 7, columns: 7, duration: 350, loop: false
          },
          displayScale: 1,
          offset: { x: 6, y: 6, random: true }
        },
        vibration: {
          enabled: true,
          pattern: [35]
        }
      }
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