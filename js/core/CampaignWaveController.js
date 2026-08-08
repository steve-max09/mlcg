export class CampaignWaveController {
  constructor({ gameState, unitDefinitions, onSpawn, onWaveStart, onWaveEnd, onBossSpawn }) {
    this.gameState = gameState;
    this.unitDefinitions = unitDefinitions;
    this.onSpawn = onSpawn;
    this.onWaveStart = onWaveStart;
    this.onWaveEnd = onWaveEnd;
    this.onBossSpawn = onBossSpawn;

    this.reset();
  }

  reset() {
    this.level = null;
    this.elapsed = 0;
    this.waveIndex = 0;
    this.waveTimers = [];
    this.active = false;
    this.completed = false;
    this.pendingBoss = null;
  }

  start(level) {
    this.reset();
    this.level = level;
    this.active = true;

    this.waveTimers = (level.waves || []).map((w) => ({
      delay: w.delay || 0,
      spawned: false,
      bossSpawned: false
    }));
  }

  update(deltaSeconds, arenaSize) {
    if (!this.active || this.completed || !this.level) return;

    this.elapsed += deltaSeconds;

    const waves = this.level.waves || [];
    for (let i = 0; i < waves.length; i++) {
      const wave = waves[i];
      const state = this.waveTimers[i];

      if (!state || state.spawned) continue;

      if (this.elapsed >= wave.delay) {
        this.spawnWave(wave, arenaSize, i);
        state.spawned = true;
      }
    }

    if (this.level.surviveDuration && this.elapsed >= this.level.surviveDuration) {
      if (this.allWavesResolved()) {
        this.completed = true;
        this.active = false;
        if (this.onWaveEnd) this.onWaveEnd(true);
      }
    }
  }

  spawnWave(wave, arenaSize, waveIndex) {
    if (this.onWaveStart) this.onWaveStart(waveIndex, wave);

    const units = wave.units || [];
    units.forEach((unitId, idx) => {
      const def = this.unitDefinitions[unitId];
      if (!def) return;

      const x = this.computeSpawnX(arenaSize, idx, units.length);
      const y = arenaSize.height * 0.15;

      this.onSpawn(def, x, y, {
        waveIndex,
        isBoss: false
      });
    });

    if (wave.boss) {
      const bossDef = this.unitDefinitions[wave.boss];
      if (bossDef) {
        const x = arenaSize.width / 2;
        const y = arenaSize.height * 0.12;

        this.onBossSpawn?.(bossDef, x, y, {
          waveIndex,
          isBoss: true
        });
      }
    }

    if (this.onWaveEnd) this.onWaveEnd(false, waveIndex);
  }

  computeSpawnX(arenaSize, idx, count) {
    const spacing = arenaSize.width * 0.12;
    const center = arenaSize.width / 2;
    return center + (idx - (count - 1) / 2) * spacing;
  }

  allWavesResolved() {
    return this.waveTimers.every((w) => w.spawned);
  }
}