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
      default:
        this.playPulse(rendererEl);
    }
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
  }
};