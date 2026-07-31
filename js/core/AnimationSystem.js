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
    const arena = el.closest("#arena");
    if (!arena) return;

    const flame = document.createElement("div");
    flame.className = "fire-spurt";

    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const distance = Math.sqrt(dx * dx + dy * dy);

    flame.style.left = `${attacker.x}px`;
    flame.style.top = `${attacker.y}px`;
    flame.style.width = `${distance}px`;
    flame.style.transform = `rotate(${angle}deg)`;

    arena.appendChild(flame);
    setTimeout(() => flame.remove(), 350);
  }
};