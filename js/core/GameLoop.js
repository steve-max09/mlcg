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

    MovementSystem.update(this.gameState, deltaSeconds);

    CombatSystem.update(this.gameState, deltaSeconds, (attacker, target) => {
      const el =
        this.renderer.getUnitElement(attacker.instanceId) ||
        this.renderer.getTowerElement(attacker.instanceId);

      if (el) {
        AnimationSystem.triggerAttackAnimation(attacker, target, el);
      }

      if (this.audioManager && attacker.sounds?.attack) {
        this.audioManager.play(attacker.sounds.attack);
      }
    });

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
}