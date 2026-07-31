import { MovementSystem } from "./MovementSystem.js";
import { CombatSystem } from "./CombatSystem.js";

export class GameLoop {
  constructor({ gameState, renderer, onEnergyChange }) {
    this.gameState = gameState;
    this.renderer = renderer;
    this.onEnergyChange = onEnergyChange;

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

    requestAnimationFrame(this.tick.bind(this));
  }

  update(deltaSeconds) {
    MovementSystem.update(this.gameState, deltaSeconds);
    CombatSystem.update(this.gameState, deltaSeconds);
    this.updateEnergy(deltaSeconds);
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