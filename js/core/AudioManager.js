export class AudioManager {
  constructor() {
    this.audioCache = new Map();
    this.isMuted = false;
    this.volume = 0.7;
  }

  preload(src) {
    if (this.audioCache.has(src)) return;
    const audio = new Audio(src);
    audio.preload = "auto";
    this.audioCache.set(src, audio);
  }

  play(src, { volume } = {}) {
    if (this.isMuted || !src) return;

    let baseAudio = this.audioCache.get(src);
    if (!baseAudio) {
      baseAudio = new Audio(src);
      this.audioCache.set(src, baseAudio);
    }

    const instance = baseAudio.cloneNode();
    instance.volume = volume !== undefined ? volume : this.volume;
    instance.play().catch(() => {});
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  setVolume(volume) {
    this.volume = Math.min(1, Math.max(0, volume));
  }
}