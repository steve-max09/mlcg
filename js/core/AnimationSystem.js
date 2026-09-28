export const AnimationSystem = {
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
      default:
        this.playPulse(rendererEl);
        return Promise.resolve();
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
    const ring = document.createElement("div");
    ring.className = "freeze-ring";
    ring.style.left = `${unit.x}px`;
    ring.style.top = `${unit.y}px`;
    ring.style.setProperty("--freeze-radius", `${radius * 2}px`);
    arenaElement.appendChild(ring);
    setTimeout(() => ring.remove(), 700);
  },

  playLightSpurt(el, attacker, target) {
    this.spawnProjectileBeam(el, attacker, target, "light-spurt");
  },

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
};