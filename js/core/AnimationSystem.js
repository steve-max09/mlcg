export const AnimationSystem = {
  triggerAttackAnimation(attacker, target, rendererEl) {
    if (!rendererEl) return;

    switch (attacker.attackAnimation) {
      case "spinSlash":
        this.playSpin(rendererEl);
        break;
      case "fireSpurt":
        this.playFireSpurt(rendererEl, attacker, target);
        break;
      case "grassSpurt":
        this.playGrassSpurt(rendererEl, attacker, target);
        break;
      case "groundSmash":
        this.playGroundSmash(rendererEl);
        break;
      case "metalSlash":
        this.playMetalSlash(rendererEl, attacker, target);
        break;
      case "coalShot":
        this.playCoalShot(rendererEl, attacker, target);
        break;
      case "iceWind":
        this.playIceWind(rendererEl, attacker, target);
        break;
      case "lightSpurt":
        this.playLightSpurt(rendererEl, attacker, target);
        break;
      case "toxicAttack":
        this.playToxicAttack(rendererEl, attacker, target);
        break;
      default:
        this.playPulse(rendererEl);
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

  playToxicAttack(el, attacker, target) {
    const arena = el.closest("#arena");
    const effectsLayer = arena?.querySelector("#effects-layer");

    if (!arena || !effectsLayer || !attacker || !target) return;

    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Position au milieu entre l'attaquant et la cible.
    // La spritesheet monte visuellement depuis le bas vers le centre.
    const effectX = attacker.x + dx * 0.5;
    const effectY = attacker.y + dy * 0.5;

    const effect = document.createElement("div");

    effect.className = "sprite-effect toxic-attack-effect";
    effect.style.left = `${effectX}px`;
    effect.style.top = `${effectY}px`;

    // La rotation est appliquée à l'élément entier.
    effect.style.setProperty("--toxic-angle", `${angle}deg`);

    effectsLayer.appendChild(effect);

    this.animateSpriteSheet({
      element: effect,
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 9,
      duration: 450,
      columns: 9
    });
  }
};