export const AnimationSystem = {
  continuousLasers: new Map(),

  triggerAttackAnimation(attacker, target, rendererEl, audioManager) {
    if (!rendererEl) {
      return Promise.resolve();
    }

    switch (attacker.attackAnimation) {
      case "spinSlash":
        this.playSpin(rendererEl);
        return Promise.resolve();
      case "fireSpurt":
        this.playFireSpurt(rendererEl, attacker, target);
        return Promise.resolve();
      case "grassSpurt":
        this.playGrassSpurt(rendererEl, attacker, target);
        return Promise.resolve();
      case "groundSmash":
        this.playGroundSmash(rendererEl);
        this.playImpactFeedback(attacker);
        return Promise.resolve();
      case "metalSlash":
        this.playMetalSlash(rendererEl, attacker, target);
        return Promise.resolve();
      case "coalShot":
        this.playCoalShot(rendererEl, attacker, target);
        return Promise.resolve();
      case "iceWind":
        this.playIceWind(rendererEl, attacker, target);
        return Promise.resolve();
      case "lightSpurt":
        this.playLightSpurt(rendererEl, attacker, target);
        return Promise.resolve();
      case "projectile":
        return this.playProjectileAttack(rendererEl, attacker, target, audioManager);
      case "continuousLaser":
        this.startContinuousLaser(rendererEl, attacker, target, audioManager);
        return Promise.resolve();
      default:
        this.playPulse(rendererEl);
        return Promise.resolve();
    }
  },

  // attaques continues (inferno)
  startContinuousLaser(el, attacker, target, audioManager) {
    const existing = this.continuousLasers.get(attacker.instanceId);

    if (existing) {
      existing.target = target;
      return;
    }

    const arena = el.closest("#arena");
    const effectsLayer = arena?.querySelector("#effects-layer");
    const config = attacker.continuousAttack;

    if (!arena || !effectsLayer || !config?.beam) return;

    const beam = document.createElement("div");
    const beamConfig = config.beam;

    beam.className = "continuous-laser";
    beam.style.backgroundImage = `url("${beamConfig.image}")`;
    beam.style.width = `${beamConfig.frameWidth}px`;
    beam.style.height = `${beamConfig.frameHeight}px`;
    beam.style.backgroundSize = `${beamConfig.frameWidth * beamConfig.columns}px ${beamConfig.frameHeight * Math.ceil(beamConfig.frameCount / beamConfig.columns)}px`;

    effectsLayer.appendChild(beam);

    const state = { attacker, target, beam, effectsLayer, config, frameStart: performance.now(),
      damageAccumulator: 0, lastTimestamp: performance.now()
    };

    this.continuousLasers.set(attacker.instanceId, state);

    if (config.startSound?.src) {
      audioManager?.play(config.startSound.src, { volume: config.startSound.volume });
    }

    this.animateContinuousLaser(state);
  },

  animateContinuousLaser(state) {
    if (!state.beam.isConnected) {
      return;
    }
    const { attacker, beam, config } = state;

    if (
      attacker.isDead ||
      !attacker.canAttack ||
      !attacker.target ||
      attacker.target.isDead ||
      attacker.target.isDestroyed
    ) {
      this.stopContinuousLaser(attacker.instanceId);
      return;
    }

    const target = attacker.target;
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > config.maxRange) {
      this.stopContinuousLaser(attacker.instanceId);
      return;
    }

    const angle = Math.atan2(dy, dx);
    const angleDeg = angle * (180 / Math.PI);
    const startOffset = config.beam.startOffset || 0;
    const startX = attacker.x + Math.cos(angle) * startOffset;
    const startY = attacker.y + Math.sin(angle) * startOffset;
    const endX = target.x;
    const endY = target.y;
    const beamDx = endX - startX;
    const beamDy = endY - startY;
    const beamDistance = Math.sqrt(beamDx * beamDx + beamDy * beamDy);

    beam.style.left = `${startX}px`;
    beam.style.top = `${startY}px`;
    beam.style.width = `${Math.max(0, beamDistance)}px`;
    beam.style.height = `${config.beam.thickness || 8}px`;
    beam.style.transform = `rotate(${angleDeg}deg)`;
    beam.style.setProperty(
      "--laser-angle",
      `${angleDeg}deg`
    );

    this.updateSpriteSheetFrame(
      beam,
      config.beam,
      state.frameStart
    );

    requestAnimationFrame(() => {
      this.animateContinuousLaser(state);
    });
  },

  updateSpriteSheetFrame(element, spriteSheet, startTime) {
    const elapsed = performance.now() - startTime;
    const duration = spriteSheet.duration || 300;
    const progress = spriteSheet.loop
      ? (elapsed % duration) / duration
      : Math.min(elapsed / duration, 1);

    const frame = Math.min(
      spriteSheet.frameCount - 1,
      Math.floor(progress * spriteSheet.frameCount)
    );

    const column = frame % spriteSheet.columns;
    const row = Math.floor(frame / spriteSheet.columns);

    element.style.backgroundPosition =
      `-${column * spriteSheet.frameWidth}px -${row * spriteSheet.frameHeight}px`;
  },

  stopContinuousLaser(attackerId) {
    const state = this.continuousLasers.get(attackerId);

    if (!state) return;

    state.beam?.remove();
    this.continuousLasers.delete(attackerId);
  },

  stopAllContinuousLasers() {
    for (const attackerId of this.continuousLasers.keys()) {
      this.stopContinuousLaser(attackerId);
    }
  },

  getImpactPosition(target, offset = {}) {
    const maxX = offset.x || 0;
    const maxY = offset.y || 0;

    if (offset.random === false) {
      return {
        x: target.x,
        y: target.y
      };
    }

    return {
      x: target.x + (Math.random() * 2 - 1) * maxX,
      y: target.y + (Math.random() * 2 - 1) * maxY
    };
  },

  getImpactRotation(rotation = {}) {
    if (rotation.random === false) {
      return rotation.value || 0;
    }

    const min = rotation.min ?? 0;
    const max = rotation.max ?? 360;

    return min + Math.random() * (max - min);
  },

  playImpactFeedback(attacker) {
    const feedback = attacker.attackFeedback;

    if (!feedback?.vibrateOnImpact) { return; }

    this.triggerVibration({enabled: true, pattern: feedback.vibrationPattern || [30]});
  },

  triggerVibration({enabled = false, pattern = [30]} = {}) {
    if (!enabled) return;

    if (!("vibrate" in navigator)) return;

    try {
      navigator.vibrate(pattern);
    } catch {
      // refus vibration.
    }
  },

  animateSpriteSheet({element, frameWidth, frameHeight, frameCount, duration, columns = frameCount}) {
    const startTime = performance.now();

    const updateFrame = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const frame = Math.min(
        frameCount - 1,
        Math.floor(progress * frameCount)
      );

      const column = frame % columns;
      const row = Math.floor(frame / columns);

      element.style.backgroundPosition = `
        -${column * frameWidth}px
        -${row * frameHeight}px
      `;

      if (progress < 1) {
        requestAnimationFrame(updateFrame);
      } else {
        element.remove();
      }
    };

    requestAnimationFrame(updateFrame);
  },

  // animations pour les projectiles utilisant une spritesheet
  animateSpriteSheetLoop({element, frameWidth, frameHeight, frameCount,columns = frameCount, duration, loop = true}) {
    const startTime = performance.now();

    const updateFrame = (timestamp) => {
      if (!element.isConnected) return;

      const elapsed = timestamp - startTime;

      let progress;

      if (loop) {
        progress = (elapsed % duration) / duration;
      } else {
        progress = Math.min(elapsed / duration, 1);
      }

      const frame = Math.min(
        frameCount - 1,
        Math.floor(progress * frameCount)
      );

      const column = frame % columns;
      const row = Math.floor(frame / columns);

      element.style.backgroundPosition = `
        -${column * frameWidth}px
        -${row * frameHeight}px
      `;

      if (!loop && progress >= 1) return;

      requestAnimationFrame(updateFrame);
    };

    requestAnimationFrame(updateFrame);
  },

  playSpin(el) {
    el.classList.remove("anim-spin");
    void el.offsetWidth;
    el.classList.add("anim-spin");
  },

  playPulse(el) {
    el.classList.remove("anim-pulse");
    void el.offsetWidth;
    el.classList.add("anim-pulse");
  },

  playFireSpurt(el, attacker, target) {
    this.spawnProjectileBeam(el, attacker, target, "fire-spurt");
  },

  playGrassSpurt(el, attacker, target) {
    const arena = el.closest("#arena");
    if (!arena) return;

    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const leafCount = 5;
    for (let i = 0; i < leafCount; i++) {
      const leaf = document.createElement("div");
      leaf.className = "leaf-particle";

      const spread = (Math.random() - 0.5) * 40;
      const travelDistance = distance * (0.7 + Math.random() * 0.3);
      const perpAngle = angle + Math.PI / 2;

      const startX = attacker.x + Math.cos(perpAngle) * spread * 0.3;
      const startY = attacker.y + Math.sin(perpAngle) * spread * 0.3;
      const endX = startX + Math.cos(angle) * travelDistance + Math.cos(perpAngle) * spread;
      const endY = startY + Math.sin(angle) * travelDistance + Math.sin(perpAngle) * spread;

      leaf.style.left = `${startX}px`;
      leaf.style.top = `${startY}px`;
      leaf.style.setProperty("--travel-x", `${endX - startX}px`);
      leaf.style.setProperty("--travel-y", `${endY - startY}px`);
      leaf.style.animationDelay = `${i * 30}ms`;

      arena.appendChild(leaf);
      setTimeout(() => leaf.remove(), 500);
    }
  },

  playMetalSlash(el, attacker, target) {
    const arena = el.closest("#arena");
    if (!arena) return;

    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const slash = document.createElement("div");
    slash.className = "metal-arc";
    slash.style.left = `${target.x}px`;
    slash.style.top = `${target.y}px`;
    slash.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

    arena.appendChild(slash);
    setTimeout(() => slash.remove(), 300);
  },

  playCoalShot(el, attacker, target) {
    const arena = el.closest("#arena");
    if (!arena) return;

    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const projectile = document.createElement("div");
    projectile.className = "coal-projectile";
    projectile.style.left = `${attacker.x}px`;
    projectile.style.top = `${attacker.y}px`;
    projectile.style.setProperty("--travel-x", `${dx}px`);
    projectile.style.setProperty("--travel-y", `${dy}px`);
    arena.appendChild(projectile);

    setTimeout(() => {
      const impact = document.createElement("div");
      impact.className = "coal-impact";
      impact.style.left = `${target.x}px`;
      impact.style.top = `${target.y}px`;
      arena.appendChild(impact);
      setTimeout(() => impact.remove(), 300);
      projectile.remove();
    }, 220);
  },

  playGroundSmash(el) {
    const arena = el.closest("#arena");
    if (!arena) return;

    el.classList.remove("anim-smash");
    void el.offsetWidth;
    el.classList.add("anim-smash");

    const rect = el.getBoundingClientRect();
    const arenaRect = arena.getBoundingClientRect();
    const x = rect.left - arenaRect.left + rect.width / 2;
    const y = rect.top - arenaRect.top + rect.height;

    const shock = document.createElement("div");
    shock.className = "ground-shock";
    shock.style.left = `${x}px`;
    shock.style.top = `${y}px`;
    arena.appendChild(shock);
    setTimeout(() => shock.remove(), 400);
  },

  spawnProjectileBeam(el, attacker, target, className) {
    const arena = el.closest("#arena");
    if (!arena) return;

    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const distance = Math.sqrt(dx * dx + dy * dy);

    const beam = document.createElement("div");
    beam.className = className;
    beam.style.left = `${attacker.x}px`;
    beam.style.top = `${attacker.y}px`;
    beam.style.width = `${distance}px`;
    beam.style.transform = `rotate(${angle}deg)`;

    arena.appendChild(beam);
    setTimeout(() => beam.remove(), 350);
  },

  playIceWind(el, attacker, target) {
    const arena = el.closest("#arena");
    if (!arena) return;

    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const gust = document.createElement("div");
    gust.className = "ice-gust";
    gust.style.left = `${attacker.x}px`;
    gust.style.top = `${attacker.y}px`;
    gust.style.width = `${distance}px`;
    gust.style.transform = `rotate(${angle}rad)`;
    arena.appendChild(gust);
    setTimeout(() => gust.remove(), 400);

    const shardCount = 4;
    for (let i = 0; i < shardCount; i++) {
      const shard = document.createElement("div");
      shard.className = "ice-shard";

      const spread = (Math.random() - 0.5) * 30;
      const perpAngle = angle + Math.PI / 2;
      const travelDistance = distance * (0.6 + Math.random() * 0.4);

      const startX = attacker.x + Math.cos(perpAngle) * spread * 0.3;
      const startY = attacker.y + Math.sin(perpAngle) * spread * 0.3;
      const endX = startX + Math.cos(angle) * travelDistance + Math.cos(perpAngle) * spread;
      const endY = startY + Math.sin(angle) * travelDistance + Math.sin(perpAngle) * spread;

      shard.style.left = `${startX}px`;
      shard.style.top = `${startY}px`;
      shard.style.setProperty("--travel-x", `${endX - startX}px`);
      shard.style.setProperty("--travel-y", `${endY - startY}px`);
      shard.style.animationDelay = `${i * 40}ms`;

      arena.appendChild(shard);
      setTimeout(() => shard.remove(), 500);
    }
  },

  playSpawnFreeze(arenaElement, unit, radius) {
    if (!arenaElement) return;
    const ring = document.createElement("div");
    ring.className = "freeze-ring";
    ring.style.left = `${unit.x}px`;
    ring.style.top = `${unit.y}px`;
    ring.style.setProperty("--freeze-radius", `${radius * 2}px`);
    arenaElement.appendChild(ring);
    setTimeout(() => ring.remove(), 700);
  },

  // vague de ralentissement
  playSlowArea(arenaElement, unit, radius) {
    if (!arenaElement) return;

    const ring = document.createElement("div");

    ring.className = "slow-ring";
    ring.style.left = `${unit.x}px`;
    ring.style.top = `${unit.y}px`;
    ring.style.setProperty("--slow-radius", `${radius * 2}px`);

    arenaElement.appendChild(ring);

    setTimeout(() => ring.remove(), 700);
  },

  playLightSpurt(el, attacker, target) {
    this.spawnProjectileBeam(el, attacker, target, "light-spurt");
  },

  // attaques projectiles
  playProjectileAttack(el, attacker, target, audioManager) {
    const projectileConfig = attacker.projectile;

    if (!projectileConfig) {
      return Promise.resolve({hit: true});
    }

    return this.createProjectile({el, attacker, target, config: projectileConfig, audioManager});
  },

  createProjectile({el, attacker, target, config, audioManager}) {
    const arena = el.closest("#arena");
    const effectsLayer = arena?.querySelector("#effects-layer");

    if (!arena || !effectsLayer || !attacker || !target) {
      return Promise.resolve({hit: false});
    }

    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 0) {
      return Promise.resolve({hit: true});
    }

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const projectile = document.createElement("div");

    const spriteSheet = config.spriteSheet;

    if (spriteSheet) {
      projectile.className = "projectile projectile-sprite projectile-" + config.type;

      projectile.style.width = `${spriteSheet.frameWidth}px`;
      projectile.style.height = `${spriteSheet.frameHeight}px`;

      projectile.style.backgroundImage = `url("${spriteSheet.image}")`;

      projectile.style.backgroundSize = `${spriteSheet.frameWidth * spriteSheet.columns}px ` +
        `${spriteSheet.frameHeight * Math.ceil(spriteSheet.frameCount / spriteSheet.columns)}px`;
    } else {
      projectile.className = `projectile projectile-${config.type}`;
    }

    projectile.style.left = `${attacker.x}px`;
    projectile.style.top = `${attacker.y}px`;

    projectile.style.setProperty("--travel-x", `${dx}px`);
    projectile.style.setProperty("--travel-y", `${dy}px`);
    projectile.style.setProperty("--projectile-angle", `${angle}deg`);

    if (spriteSheet) {
      this.animateSpriteSheetLoop({
        element: projectile,
        frameWidth: spriteSheet.frameWidth,
        frameHeight: spriteSheet.frameHeight,
        frameCount: spriteSheet.frameCount,
        columns: spriteSheet.columns,
        duration: spriteSheet.duration || 500,
        loop: spriteSheet.loop !== false
      });
    }

    effectsLayer.appendChild(projectile);

    if (attacker.sounds?.projectileLaunch) {
      audioManager?.play(attacker.sounds.projectileLaunch);
    }

    const durationConfig = config.travelDuration || {};

    const minDuration = durationConfig.min || 180;
    const maxDuration = durationConfig.max || 800;
    const pixelsPerMillisecond = durationConfig.pixelsPerMillisecond || 2.2;

    const travelDuration = Math.max(minDuration, Math.min(maxDuration, distance * pixelsPerMillisecond));

    projectile.style.animationDuration = `${travelDuration}ms`;

    return new Promise((resolve) => {
      window.setTimeout(() => {
        projectile.remove();

        const impactPosition = this.getImpactPosition(target, config.impact?.offset);
        this.playImpactEffect({effectsLayer, target, x: impactPosition.x, y: impactPosition.y, impact: config.impact});

        const vibration = config.vibration || attacker.attackFeedback;
        this.triggerVibration({
          enabled: vibration?.enabled === true,
          pattern: vibration?.pattern || vibration?.vibrationPattern || [30]
        });

        if (attacker.sounds?.projectileImpact) {
          audioManager?.play(attacker.sounds.projectileImpact);
        }

        resolve({hit: true});
      }, travelDuration);
    });
  },

  playImpactEffect({effectsLayer, target, x, y, impact}) {
    const impactX = x ?? target.x;
    const impactY = y ?? target.y;
    this.playImpact(effectsLayer, impactX, impactY, impact);
  },

  playImpact(effectsLayer, x, y, impactConfig) {
    if (!impactConfig?.spriteSheet) return;

    const spriteSheet = impactConfig.spriteSheet;
    const impact = document.createElement("div");

    impact.className = "sprite-effect impact-effect";
    impact.style.left = `${x}px`;
    impact.style.top = `${y}px`;
    impact.style.width = `${spriteSheet.frameWidth}px`;
    impact.style.height = `${spriteSheet.frameHeight}px`;
    impact.style.backgroundImage = `url("${spriteSheet.image}")`;
    impact.style.backgroundSize = `${spriteSheet.frameWidth * spriteSheet.columns}px ${spriteSheet.frameHeight * Math.ceil(spriteSheet.frameCount / spriteSheet.columns)}px`;

    const scale = impactConfig.displayScale ?? 1;
    impact.style.setProperty("--impact-scale", scale);

    const rotation = this.getImpactRotation(impactConfig.rotation);
    impact.style.setProperty("--impact-rotation", `${rotation}deg`);

    effectsLayer.appendChild(impact);

    this.animateSpriteSheet({
      element: impact,
      frameWidth: spriteSheet.frameWidth,
      frameHeight: spriteSheet.frameHeight,
      frameCount: spriteSheet.frameCount,
      duration: spriteSheet.duration || 450,
      columns: spriteSheet.columns,
      loop: spriteSheet.loop === true
    });
  },

  // zone de dégâts passifs (effet spécial)
  playPassiveDamageArea(arenaElement, unit, radius) {
    const effect = document.createElement("div");

    effect.className = "passive-damage-area";
    effect.style.left = `${unit.x}px`;
    effect.style.top = `${unit.y}px`;
    effect.style.width = `${radius * 2}px`;
    effect.style.height = `${radius * 2}px`;

    arenaElement.appendChild(effect);

    setTimeout(() => effect.remove(), 350);
  },

  // explosion au spawn
  playSpawnExplosion(arenaElement, unit, radius) {
    const effectsLayer = arenaElement?.querySelector("#ground-effects-layer");

    if (!effectsLayer) return;

    const spriteSheet = {
      image: "assets/effects/scrap-impact.png",
      frameWidth: 128, frameHeight: 129, frameCount: 7, columns: 7, duration: 350
    };

    const explosion = document.createElement("div");
    explosion.className = "sprite-effect spawn-explosion";
    explosion.style.left = `${unit.x}px`;
    explosion.style.top = `${unit.y}px`;
    explosion.style.width = `${spriteSheet.frameWidth}px`;
    explosion.style.height = `${spriteSheet.frameHeight}px`;
    explosion.style.backgroundImage = `url("${spriteSheet.image}")`;

    explosion.style.backgroundSize =
      `${spriteSheet.frameWidth * spriteSheet.columns}px ` + `${spriteSheet.frameHeight}px`;

    explosion.style.setProperty("--explosion-scale", `${Math.max(1, radius / 64)}`);

    effectsLayer.appendChild(explosion);

    this.animateSpriteSheet({
      element: explosion,
      frameWidth: spriteSheet.frameWidth,
      frameHeight: spriteSheet.frameHeight,
      frameCount: spriteSheet.frameCount,
      duration: spriteSheet.duration,
      columns: spriteSheet.columns
    });
  },

  // cercle de l'explosion
  playSpawnExplosionRing(arenaElement, unit, radius) {
    if (!arenaElement) return;

    const ring = document.createElement("div");

    ring.className = "explode-spawn-ring";
    ring.style.left = `${unit.x}px`;
    ring.style.top = `${unit.y}px`;
    ring.style.setProperty("--explode-radius", `${radius * 2}px`);

    arenaElement.appendChild(ring);

    setTimeout(() => {
      ring.remove();
    }, 700);
  }
};