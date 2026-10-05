import { MovementSystem } from "./MovementSystem.js";
import { CombatSystem } from "./CombatSystem.js";
import { AnimationSystem } from "./AnimationSystem.js";

export class GameLoop {
  constructor({ gameState, renderer, onEnergyChange, onGameOver, aiController, audioManager, campaignWaveController, updateCampaignTimer, onCampaignComplete }) {
    this.gameState = gameState;
    this.renderer = renderer;
    this.onEnergyChange = onEnergyChange;
    this.onGameOver = onGameOver;
    this.aiController = aiController;
    this.audioManager = audioManager;

    this.campaignWaveController = campaignWaveController;
    this.updateCampaignTimer = updateCampaignTimer;
    this.onCampaignComplete = onCampaignComplete;

    this.lastTimestamp = null;
    this.energyAccumulator = 0;
    this.isRunning = false;
    this.previousTowerStates = new Map();
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    requestAnimationFrame(this.tick.bind(this));
  }

  stop() {
    this.isRunning = false;
    this.lastTimestamp = null;
    this.energyAccumulator = 0;
    this.previousTowerStates.clear();
    AnimationSystem.stopAllContinuousLasers();
  }

  tick(timestamp) {
    if (!this.isRunning) return;

    const deltaSeconds = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    this.update(deltaSeconds);
    this.renderer.render(this.gameState);

    if (this.gameState.isGameOver) {
      this.stop();
      if (this.onGameOver) this.onGameOver(this.gameState.winner);
      return;
    }

    requestAnimationFrame(this.tick.bind(this));
  }

  update(deltaSeconds) {
    const arenaSize = this.getArenaSize();

    // si on est en mode surviveWaves on met à jour le timer
    if (this.updateCampaignTimer) {
      this.updateCampaignTimer(deltaSeconds);
    }

    for (const tower of this.gameState.towers) {
      tower.updateStatusEffects(deltaSeconds);
    }

    MovementSystem.update(this.gameState, deltaSeconds, arenaSize);

    // effets spéciaux
    this.updatePassiveEffects(deltaSeconds);

    CombatSystem.update(this.gameState, deltaSeconds, (attacker, target, attackResult) => {
      const el =
        this.renderer.getUnitElement(attacker.instanceId) ||
        this.renderer.getTowerElement(attacker.instanceId);

      if (this.audioManager && attacker.sounds?.attack) {
        this.audioManager.play(attacker.sounds.attack);
      }

      // attaques continues (inferno)
      if (attacker.continuousAttack) {
        if (el) {
          AnimationSystem.triggerAttackAnimation(attacker, target, el, this.audioManager);
        }
        return;
      }

      if (!el) {
        if (attackResult?.delayed) {
          attackResult.apply();
        }

        return;
      }

      const animationPromise = AnimationSystem.triggerAttackAnimation(attacker, target, el, this.audioManager);

      if (attackResult?.delayed && attackResult.apply) {
        animationPromise.then(() => {
          attackResult.apply();
        });
      }
    });

    // attaques continues (inferno)
    this.syncContinuousAnimations();

    if (this.campaignWaveController) {
      this.campaignWaveController.update(deltaSeconds, arenaSize);
    }

    if (this.onCampaignComplete && this.onCampaignComplete()) {
      return;
    }

    if (this.aiController) {
      this.aiController.update(deltaSeconds, arenaSize);
    }

    this.checkDeaths();
    this.checkTowerDestruction();
    this.updateEnergy(deltaSeconds);
  }

  checkDeaths() {
    for (const unit of this.gameState.units) {
      if (unit.isDead && !unit.deathSoundPlayed) {
        unit.deathSoundPlayed = true;
        if (this.audioManager && unit.sounds.death) {
          this.audioManager.play(unit.sounds.death);
        }
      }
    }
  }

  checkTowerDestruction() {
    for (const tower of this.gameState.towers) {
      const wasDestroyed = this.previousTowerStates.get(tower.instanceId);
      if (tower.isDestroyed && !wasDestroyed) {
        this.previousTowerStates.set(tower.instanceId, true);
        if (this.audioManager) {
          this.audioManager.play(this.audioManager.uiSounds.towerDestroyed);
        }
      }
    }
  }

  getArenaSize() {
    const rect = this.renderer.arenaElement.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  updateEnergy(deltaSeconds) {
    this.energyAccumulator += deltaSeconds * 1000;
    if (this.energyAccumulator >= this.gameState.energyRegenInterval) {
      this.energyAccumulator = 0;
      this.gameState.regenEnergy();
      if (this.onEnergyChange) this.onEnergyChange(this.gameState.energy);
    }
  }

  // attaques continues (inferno)
  syncContinuousAnimations() {
    for (const unit of this.gameState.units) {
      if (unit.isDead || !unit.continuousAttack) continue;

      const el = this.renderer.getUnitElement(
        unit.instanceId
      );

      if (!el) continue;

      if (
        unit.target &&
        !unit.target.isDead &&
        !unit.target.isDestroyed &&
        unit.distanceTo(unit.target) <=
          (unit.continuousAttack.maxRange ||
            unit.attackRange)
      ) {
        AnimationSystem.triggerAttackAnimation(
          unit,
          unit.target,
          el,
          this.audioManager
        );
      }
    }
  }

  // effets spéciaux
  updatePassiveEffects(deltaSeconds) {
    const entities = [...this.gameState.units, ...this.gameState.towers];

    for (const entity of entities) {
      if (entity.isDead || entity.isDestroyed) continue;

      const effects = entity.effects || {};

      if (effects.passiveHeal) {
        entity.passiveHealAccumulator += effects.passiveHeal * deltaSeconds;

        const healAmount = Math.floor(entity.passiveHealAccumulator);

        if (healAmount > 0) {
          entity.passiveHealAccumulator -= healAmount;
          entity.hp = Math.min(entity.maxHp, entity.hp + healAmount);
        }
      }

      if (effects.passiveDamageArea && effects.passiveDamage) {
        this.updatePassiveAreaDamage(entity, deltaSeconds);
      }
    }
  }

  // auto soin passif
  updatePassiveHeal(entity, deltaSeconds) {
    entity.passiveHealAccumulator += entity.effects.passiveHeal * deltaSeconds;

    const healAmount = Math.floor(entity.passiveHealAccumulator);

    if (healAmount > 0) {
      entity.passiveHealAccumulator -= healAmount;
      entity.hp = Math.min(entity.maxHp, entity.hp + healAmount);
    }
  }

  // dégâts de zone passifs
  updatePassiveAreaDamage(entity, deltaSeconds) {
    const effects = entity.effects || {};
    const radius = effects.passiveDamageArea;
    const damagePerTick = effects.passiveDamage;
    const tickInterval = effects.passiveDamageTick || 1;

    entity.passiveDamageAccumulator += deltaSeconds;

    if (entity.passiveDamageAccumulator < tickInterval) {
      return;
    }

    entity.passiveDamageAccumulator -= tickInterval;

    const enemies = [
      ...this.gameState.getEnemiesOf(entity.team),
      ...this.gameState.getTowersOf(entity.team === "player" ? "enemy" : "player")
    ];

    this.audioManager.play(this.audioManager.uiSounds.shortzap);

    AnimationSystem.playPassiveDamageArea(this.renderer.arenaElement, entity, radius);

    for (const enemy of enemies) {
      if (enemy.isDead || enemy.isDestroyed) {
        continue;
      }

      const dx = enemy.x - entity.x;
      const dy = enemy.y - entity.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius && typeof enemy.takeDamage === "function") {
        enemy.takeDamage(damagePerTick);
      }
    }
  }
}