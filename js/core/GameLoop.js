import { MovementSystem } from "./MovementSystem.js";
import { CombatSystem } from "./CombatSystem.js";
import { AnimationSystem } from "./AnimationSystem.js";

export class GameLoop {
  constructor({ gameState, renderer, onEnergyChange, onGameOver, aiController }) {
    this.gameState = gameState;
    this.renderer = renderer;
    this.onEnergyChange = onEnergyChange;
    this.onGameOver = onGameOver;
    this.aiController = aiController;

    this.lastTimestamp = null;
    this.energyAccumulator = 0;
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    requestAnimationFrame(this.tick.bind(this));
  }

  stop() {
    this.isRunning = false;
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

    MovementSystem.update(this.gameState, deltaSeconds, arenaSize);
    CombatSystem.update(this.gameState, deltaSeconds, (attacker, target) => {
      const el = this.renderer.getUnitElement(attacker.instanceId);
      AnimationSystem.triggerAttackAnimation(attacker, target, el);
    });
    this.updateEnergy(deltaSeconds);

    if (this.aiController) {
      this.aiController.update(deltaSeconds, arenaSize);
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
      this.gameState.enemyEnergy = Math.min(
        this.gameState.maxEnergy,
        this.gameState.enemyEnergy + this.gameState.energyRegenRate
      );
      if (this.onEnergyChange) this.onEnergyChange(this.gameState.energy);
    }
  }
}