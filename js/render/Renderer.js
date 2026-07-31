export class Renderer {
  constructor(arenaElement) {
    this.arenaElement = arenaElement;
    this.elements = new Map();
  }

  syncUnit(unit) {
    let el = this.elements.get(unit.instanceId);
    if (!el) {
      el = document.createElement("div");
      el.className = `game-unit team-${unit.team}`;
      el.innerHTML = `<img src="${unit.sprite}" alt="${unit.name}" />
        <div class="hp-bar"><div class="hp-fill"></div></div>`;
      this.arenaElement.appendChild(el);
      this.elements.set(unit.instanceId, el);
    }

    el.style.left = `${unit.x}px`;
    el.style.top = `${unit.y}px`;

    const hpRatio = Math.max(0, unit.hp / unit.maxHp) * 100;
    el.querySelector(".hp-fill").style.width = `${hpRatio}%`;
  }

  removeUnit(instanceId) {
    const el = this.elements.get(instanceId);
    if (el) {
      el.remove();
      this.elements.delete(instanceId);
    }
  }

  cleanupDeadUnits(gameState) {
    const aliveIds = new Set(gameState.units.map((u) => u.instanceId));
    for (const [id] of this.elements) {
      if (!aliveIds.has(id)) this.removeUnit(id);
    }
  }

  render(gameState) {
    for (const unit of gameState.units) {
      if (!unit.isDead) this.syncUnit(unit);
    }
    this.cleanupDeadUnits(gameState);
  }
}