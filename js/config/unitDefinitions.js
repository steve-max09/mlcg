// stats de chaque unité / tour / base
export const UnitDefinitions = {
  base_usine: {
    category: "base",
    id: "base_usine",
    name: "Usine",
    description: "Une usine standard qui fournit l'énergie et défend la ligne centrale.",
    sprite: "assets/bases/usine.png",
    rarity: 0,
    hp: 1000,
    damage: 15,
    attackSpeed: 0.8,
    attackRange: 120,
    hitboxRadius: 60,
    targetType: "ground",
    canMove: false,
    canAttack: true,
    attackAnimation: "projectile",
    projectile: {
      type: "defaultProjectile",
      travelDuration: {
        min: 220,
        max: 800,
        pixelsPerMillisecond: 4.2
      },
      impact: {
        spriteSheet: {
          image: "assets/effects/generic-impact.png",
          frameWidth: 128, frameHeight: 129, frameCount: 7, columns: 7, duration: 350, loop: false
        },
        displayScale: 1,
        offset: { x: 6, y: 6, random: true }
      }
    },
    sounds: {
      spawn: null,
      projectileLaunch: "assets/sounds/units/tower-attack.mp3",
      death: "assets/sounds/ui/tower-destroyed.mp3"
    }
  },

  base_barbie: {
    category: "base",
    id: "base_barbie",
    name: "Maison de Barbie",
    description: "La maison de Barbie. Un avant-poste respectable en temps de guerre.",
    sprite: "assets/bases/barbie.png",
    rarity: 1,
    hp: 1200,
    damage: 50,
    attackSpeed: 0.9,
    attackRange: 120,
    hitboxRadius: 60,
    targetType: "ground",
    canMove: false,
    canAttack: true,
    attackAnimation: "projectile",
    projectile: {
      type: "toxicProjectile",
      spriteSheet: {
        image: "assets/effects/pink-strobe-projectile.png",
        frameWidth: 128, frameHeight: 129, frameCount: 4, columns: 4, duration: 600, loop: true
      },
      travelDuration: {
        min: 220,
        max: 800,
        pixelsPerMillisecond: 9.2
      },
      impact: {
        spriteSheet: {
          image: "assets/effects/toxic-cloud-impact.png",
          frameWidth: 128, frameHeight: 129, frameCount: 4, columns: 4, duration: 200, loop: false
        },
        displayScale: 1,
        offset: { x: 6, y: 6, random: true }
      }
    },
    sounds: {
      spawn: null,
      projectileLaunch: "assets/sounds/units/barbie-attack.mp3",
      projectileImpact: "assets/sounds/units/barbie-impact.mp3",
      death: "assets/sounds/ui/tower-destroyed.mp3"
    }
  },

  tower_standard: {
    category: "tower",
    id: "tower_standard",
    name: "Tour du début du jeu",
    description: "Une tour polyvalente qui protège les flancs.",
    sprite: "assets/bases/tour-standard.png",
    rarity: 0,
    hp: 700,
    damage: 10,
    attackSpeed: 1.0,
    attackRange: 120,
    hitboxRadius: 40,
    targetType: "ground",
    canMove: false,
    canAttack: true,
    attackAnimation: "projectile",
    projectile: {
      type: "defaultProjectile",
      travelDuration: {
        min: 220,
        max: 800,
        pixelsPerMillisecond: 4.2
      },
      impact: {
        spriteSheet: {
          image: "assets/effects/generic-impact.png",
          frameWidth: 128, frameHeight: 129, frameCount: 7, columns: 7, duration: 350, loop: false
        },
        displayScale: 1,
        offset: { x: 6, y: 6, random: true }
      }
    },
    sounds: {
      spawn: null,
      projectileLaunch: "assets/sounds/units/tower-attack.mp3",
      death: "assets/sounds/ui/tower-destroyed.mp3"
    }
  },

  tower_coalshot: {
    category: "tower",
    id: "tower_coalshot",
    name: "Tour mega dégâts",
    description: "Une tour polyvalente qui protège les flancs.",
    sprite: "assets/bases/tour-coalshot.png",
    rarity: 1,
    hp: 800,
    damage: 20,
    attackSpeed: 0.9,
    attackRange: 120,
    hitboxRadius: 40,
    targetType: "ground",
    canMove: false,
    canAttack: true,
    attackAnimation: "projectile",
    effects: {
      explodeOnDeathArea: 70,
      explodeOnDeathDamage: 200
    },
    projectile: {
      type: "scrapProjectile",
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
      }
    },
    aoeRadius: 50,
    aoeCenter: "target",
    sounds: {
      spawn: null,
      projectileLaunch: "assets/sounds/units/tombereau-launch.mp3",
      projectileImpact: "assets/sounds/units/tombereau-hit.mp3",
      death: "assets/sounds/ui/tower-destroyed.mp3"
    }
  },

  tower_mega: {
    category: "tower",
    id: "tower_mega",
    name: "Gratte-ciel",
    description: "La tour idéale pour le business. Équipée d'un système de sécurité moderne.",
    sprite: "assets/bases/tour-mega.png",
    rarity: 1,
    hp: 800,
    damage: 45,
    attackSpeed: 1.0,
    attackRange: 130,
    hitboxRadius: 40,
    targetType: "ground",
    canMove: false,
    canAttack: true,
    attackAnimation: "continuousLaser",
    continuousAttack: {
      damagePerSecond: 30,
      maxRange: 130,
      beam: {
        thickness: 4,
        startOffset: 18
      },
      startSound: {
        src: "assets/sounds/units/araignee-attack.mp3",
        volume: 0.6
      }
    },
    effects: {
      passiveDamageArea: 120,
      passiveDamageTick: 10,
      passiveDamage: 100
    },
    sounds: {
      spawn: null,
      death: "assets/sounds/ui/tower-destroyed.mp3"
    }
  },

  chauffage: {
    category: "unit",
    id: "chauffage",
    name: "Chauffage mobile fioul 50000 kcal/h",
    description: "Un chauffage efficace qui explose quand il est détruit.",
    rarity: 0,
    sprite: "assets/loxams/Chauffage mobile fioul 50 000 kcal.png",
    renderScale: 0.65,
    cost: 4,
    hp: 200,
    damage: 10,
    attackSpeed: 1.2,
    movementSpeed: 20,
    attackRange: 100,
    hitboxRadius: 22,
    targetType: "any",
    canMove: true,
    canAttack: true,
    attackAnimation: "projectile",
    effects: {
      explodeOnDeathArea: 60,
      explodeOnDeathDamage: 60
    },
    projectile: {
      type: "toxicProjectile",
      spriteSheet: {
        image: "assets/effects/fire-strobe-projectile.png",
        frameWidth: 128, frameHeight: 129, frameCount: 4, columns: 4, duration: 600, loop: true
      },
      travelDuration: {
        min: 220,
        max: 800,
        pixelsPerMillisecond: 9.2
      },
      impact: {
        spriteSheet: {
          image: "assets/effects/fire-cloud-impact.png",
          frameWidth: 128, frameHeight: 129, frameCount: 4, columns: 4, duration: 200, loop: false
        },
        displayScale: 1,
        offset: { x: 6, y: 6, random: true }
      }
    },
    aoeRadius: 50,
    aoeCenter: "target",
    sounds: {
      spawn: "assets/sounds/units/chauffage-spawn.mp3",
      attack: "assets/sounds/units/chauffage-attack.mp3",
      death: "assets/sounds/units/chauffage-death.mp3"
    }
  },

  motobineuse: {
    category: "unit",
    id: "motobineuse",
    name: "Motobineuse",
    description: "Description manquante",
    rarity: 0,
    sprite: "assets/loxams/Motobineuse.png",
    renderScale: 0.85,
    cost: 3,
    hp: 200,
    damage: 20,
    attackSpeed: 1.5,
    movementSpeed: 50,
    attackRange: 30,
    hitboxRadius: 22,
    targetType: "any",
    canMove: true,
    canAttack: true,
    attackAnimation: "spinSlash",
    sounds: {
      spawn: "assets/sounds/units/motobineuse-spawn.mp3",
      attack: "assets/sounds/units/motobineuse-attack.mp3",
      death: "assets/sounds/units/motobineuse-death.mp3"
    }
  },

  compacteur: {
    category: "unit",
    id: "compacteur",
    name: "Compacteur monocylindre Grand Travaux",
    description: "Description manquante",
    rarity: 1,
    sprite: "assets/loxams/Compacteur monocylindre Grand Travaux.png",
    renderScale: 1.2,
    cost: 6,
    hp: 600,
    armor: 0,
    knockbackResistance: 150,
    damage: 60,
    attackSpeed: 0.7,
    movementSpeed: 20,
    attackRange: 50,
    hitboxRadius: 26,
    targetType: "any",
    canMove: true,
    canAttack: true,
    attackAnimation: "groundSmash",
    effects: {
      slowOnSpawnArea: 150,
      slowOnSpawnAmount: 50,
      slowOnSpawnDuration: 4,
      explodeOnSpawnArea: 100,
      explodeOnSpawnDamage: 40
    },
    vibration: {
      enabled: true,
      pattern: [35]
    },
    aoeRadius: 70,
    aoeCenter: "self",
    sounds: {
      spawn: "assets/sounds/units/compacteur-spawn.mp3",
      attack: "assets/sounds/units/compacteur-attack.mp3",
      death: "assets/sounds/units/compacteur-death.mp3"
    }
  },

  broyeur: {
    category: "unit",
    id: "broyeur",
    name: "Broyeur de végétaux",
    description: "Description manquante",
    rarity: 0,
    sprite: "assets/loxams/Broyeur de végétaux.png",
    renderScale: 0.85,
    cost: 5,
    hp: 200,
    damage: 50,
    attackSpeed: 0.5,
    movementSpeed: 30,
    attackRange: 130,
    hitboxRadius: 22,
    targetType: "any",
    canMove: true,
    canAttack: true,
    attackAnimation: "grassSpurt",
    sounds: {
      spawn: "assets/sounds/units/broyeur-spawn.mp3",
      attack: "assets/sounds/units/broyeur-attack.mp3",
      death: "assets/sounds/units/broyeur-death.mp3"
    }
  },

  minipelle: {
    category: "unit",
    id: "minipelle",
    name: "Minipelle sur chenilles",
    description: "Une minipelle rapide et puissante.",
    rarity: 1,
    sprite: "assets/loxams/Minipelle sur chenilles.png",
    renderScale: 1.0,
    cost: 4,
    hp: 350,
    knockbackResistance: 55,
    damage: 37,
    attackSpeed: 1,
    movementSpeed: 50,
    attackRange: 50,
    hitboxRadius: 22,
    targetType: "any",
    canMove: true,
    canAttack: true,
    attackAnimation: "metalSlash",
    effects: {
      knockback: 10
    },
    sounds: {
      spawn: "assets/sounds/units/minipelle-spawn.mp3",
      attack: "assets/sounds/units/minipelle-attack.mp3",
      death: "assets/sounds/units/generic-death.mp3"
    }
  },
  
  tombereau: {
    category: "unit",
    id: "tombereau",
    name: "Tombereau articulé",
    description: "Description manquante",
    rarity: 0,
    sprite: "assets/loxams/Tombereau articulé.png",
    renderScale: 1.25,
    cost: 7,
    hp: 800,
    armor: 8,
    knockbackResistance: 60,
    damage: 100,
    attackSpeed: 0.3,
    movementSpeed: 20,
    attackRange: 110,
    hitboxRadius: 26,
    targetType: "any",
    canMove: true,
    canAttack: true,
    attackAnimation: "projectile",
    effects: {
      knockback: 10,
      slowTargetsAmount: 10,
      slowTargetsDuration: 3.5
    },
    projectile: {
      type: "scrapProjectile",
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
    },
    aoeRadius: 80,
    aoeCenter: "target",
    sounds: {
      spawn: "assets/sounds/units/tombereau-spawn.mp3",
      projectileLaunch: "assets/sounds/units/tombereau-launch.mp3",
      projectileImpact: "assets/sounds/units/tombereau-hit.mp3",
      death: "assets/sounds/units/generic-death.mp3"
    }
  },

  climatiseur: {
    category: "unit",
    id: "climatiseur",
    name: "Climatiseur mobile 6 kW",
    description: "Idéal pour les fortes chaleurs.",
    rarity: 2,
    sprite: "assets/loxams/Climatiseur mobile 6 kW.png",
    renderScale: 0.65,
    cost: 4,
    hp: 180,
    damage: 17,
    attackSpeed: 0.8,
    movementSpeed: 30,
    attackRange: 100,
    hitboxRadius: 22,
    targetType: "any",
    canMove: true,
    canAttack: true,
    attackAnimation: "iceWind",
    effects: {
      freezeOnSpawnArea: 170,
      freezeOnSpawnDuration: 2,
      freezeTargetsDuration: 1.5
    },
    sounds: {
      spawn: "assets/sounds/units/climatiseur-spawn.mp3",
      attack: "assets/sounds/units/climatiseur-attack.mp3",
      death: "assets/sounds/units/climatiseur-death.mp3"
    },
  },

  brumisateur: {
    category: "unit",
    id: "brumisateur",
    name: "Brumisateur mobile",
    description: "Description manquante",
    rarity: 0,
    sprite: "assets/loxams/Brumisateur mobile.png",
    renderScale: 0.65,
    cost: 3,
    hp: 160,
    damage: 20,
    attackSpeed: 1.5,
    movementSpeed: 50,
    attackRange: 80,
    hitboxRadius: 22,
    targetType: "any",
    canMove: true,
    canAttack: true,
    attackAnimation: "iceWind",
    sounds: {
      spawn: "assets/sounds/units/brumisateur-spawn.mp3",
      attack: "assets/sounds/units/brumisateur-attack.mp3",
      death: "assets/sounds/units/brumisateur-death.mp3"
    },
  },

  chariot: {
    category: "unit",
    id: "chariot",
    name: "Chariot téléscopique diesel compact",
    description: "Un grand chariot qui priorise les dégâts sur les bâtiments ennemis.",
    rarity: 0,
    sprite: "assets/loxams/Chariot téléscopique diesel compact.png",
    renderScale: 1.25,
    cost: 6,
    hp: 740,
    armor: 5,
    knockbackResistance: 60,
    damage: 100,
    attackSpeed: 0.5,
    movementSpeed: 20,
    attackRange: 60,
    hitboxRadius: 26,
    targetType: "buildings",
    canMove: true,
    canAttack: true,
    attackAnimation: "metalSlash",
    effects: {
      lifesteal: 10,
      knockback: 70
    },
    sounds: {
      spawn: "assets/sounds/units/chariot-spawn.mp3",
      attack: "assets/sounds/units/chariot-attack.mp3",
      death: "assets/sounds/units/generic-death.mp3"
    },
  },

  mat: {
    category: "unit",
    id: "mat",
    name: "Mât d'éclairage 2 200 m² hybride",
    description: "Production autonome de lumières destinée aux travaux nocturnes et manifestations événementielles.",
    rarity: 2,
    sprite: "assets/loxams/Mât d'éclairage 2 200 m² hybride.png",
    renderScale: 0.85,
    cost: 5,
    hp: 300,
    damage: 60,
    attackSpeed: 0.8,
    movementSpeed: 0,
    attackRange: 80,
    hitboxRadius: 22,
    targetType: "ground",
    canAttack: true,
    attackAnimation: "lightSpurt",
    sounds: {
      spawn: "assets/sounds/units/mat-spawn.mp3",
      attack: "assets/sounds/units/mat-attack.mp3",
      death: "assets/sounds/units/generic-death.mp3"
    },
  },

  fendeuse: {
    category: "unit",
    id: "fendeuse",
    name: "Fendeuse thermique",
    description: "Cette fendeuse de bûches thermique projette des bûches épaisses allant jusqu'à 1m de diamètre.",
    rarity: 0,
    sprite: "assets/loxams/Fendeuse thermique.png",
    renderScale: 0.85,
    cost: 2,
    hp: 120,
    damage: 20,
    attackSpeed: 0.3,
    movementSpeed: 50,
    attackRange: 80,
    hitboxRadius: 22,
    targetType: "any",
    canMove: true,
    canAttack: true,
    attackAnimation: "projectile",
    effects: {
      knockback: 60
    },
    projectile: {
      type: "spinningLogProjectile",
      spriteSheet: {
        image: "assets/effects/spinning-log-projectile.png",
        frameWidth: 128, frameHeight: 129, frameCount: 9, columns: 9, duration: 300, loop: true
      },
      travelDuration: {
        min: 220,
        max: 800,
        pixelsPerMillisecond: 20.2
      },
      impact: {
        spriteSheet: {
          image: "assets/effects/log-impact.png",
          frameWidth: 128, frameHeight: 129, frameCount: 5, columns: 5, duration: 200, loop: false
        },
        displayScale: 1,
        offset: { x: 6, y: 6, random: true }
      }
    },
    sounds: {
      spawn: "assets/sounds/units/fendeuse-spawn.mp3",
      projectileLaunch: "assets/sounds/units/fendeuse-attack.mp3",
      projectileImpact: "assets/sounds/units/fendeuse-hit.mp3",
      death: "assets/sounds/units/generic-death.mp3"
    }
  },

  araignee: {
    category: "unit",
    id: "araignee",
    name: "Nacelle Araignée FALCON-FS330Z 33m",
    description: "Une nacelle puissante avec une attaque laser ultra-haute précision.",
    rarity: 2,
    sprite: "assets/loxams/Nacelle Araignee.png",
    renderScale: 1.5,
    cost: 10,
    hp: 900,
    armor: 5,
    knockbackResistance: 100,
    attackSpeed: 0.3,
    movementSpeed: 20,
    attackRange: 130,
    hitboxRadius: 28,
    targetType: "any",
    canMove: true,
    canAttack: true,
    attackAnimation: "continuousLaser",
    continuousAttack: {
      damagePerSecond: 50,
      maxRange: 110,
      beam: {
        thickness: 6,
        startOffset: 18
      },
      startSound: {
        src: "assets/sounds/units/araignee-attack.mp3",
        volume: 0.6
      }
    },
    sounds: {
      spawn: "assets/sounds/units/araignee-spawn.mp3",
      death: "assets/sounds/units/araignee-death.mp3"
    }
  }
};
