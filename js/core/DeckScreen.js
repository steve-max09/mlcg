import { UnitDefinitions } from "../config/unitDefinitions.js";

const DEPLOYABLE_UNITS = [
  "chauffage",
  "motobineuse",
  "compacteur",
  "broyeur",
  "minipelle",
  "tombereau",
  "climatiseur",
  "brumisateur",
  "chariot",
  "mat"
];

export class DeckScreen {
  constructor({ playerProgress, elements, onBattleStart, onBack }) {
    this.playerProgress = playerProgress;
    this.el = elements;
    this.onBattleStart = onBattleStart;
    this.onBack = onBack;
    this.selectedUnitId = null;
    this.collectionFilter = "unit"; // "unit" | "tower" | "base"

    this.bindEvents();
  }

  bindEvents() {
    this.el.backBtn.addEventListener("click", () => {
      if (this.onBack) this.onBack();
    });

    this.el.battleBtn.addEventListener("click", () => {
      if (this.playerProgress.isDeckComplete() && this.onBattleStart) {
        this.onBattleStart();
      }
    });

    this.el.modalClose.addEventListener("click", () => this.closeModal());
    this.el.modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.el.modalOverlay) this.closeModal();
    });

    // nav entre units / towers / bases
    this.el.filterUnitsBtn.addEventListener("click", () => {
      this.collectionFilter = "unit";
      this.renderCollection();
    });
    this.el.filterTowersBtn.addEventListener("click", () => {
      this.collectionFilter = "tower";
      this.renderCollection();
    });
    this.el.filterBasesBtn.addEventListener("click", () => {
      this.collectionFilter = "base";
      this.renderCollection();
    });
  }

  render() {
    this.el.yangaAmount.textContent = this.playerProgress.yanga;
    this.renderBaseAndTowers();
    this.renderDeckSlots();
    this.renderCollection();
  }

  renderDeckSlots() {
    this.el.deckSlots.innerHTML = "";

    for (let i = 0; i < 8; i++) {
      const unitId = this.playerProgress.deck[i];
      const slot = document.createElement("div");
      slot.className = "deck-slot";

      if (unitId) {
        const def = UnitDefinitions[unitId];
        slot.classList.add("filled", `rarity-${def.rarity}`);
        slot.innerHTML = `
          <img src="${def.sprite}" alt="${def.name}" />
          <span class="deck-slot-cost">${def.cost}</span>
        `;
        slot.addEventListener("click", () => this.openModal(unitId, true));
      } else {
        slot.classList.add("empty");
        slot.innerHTML = `<span class="deck-slot-plus">+</span>`;
      }

      this.el.deckSlots.appendChild(slot);
    }

    this.el.collectionCount.textContent = `${this.playerProgress.deck.length}/8`;
  }

  renderCollection() {
    this.el.collectionGrid.innerHTML = "";

    const allIds = Object.keys(UnitDefinitions);
    const filtered = allIds.filter((id) => {
      const def = UnitDefinitions[id];
      if (!def) return false;
      if (def.category !== this.collectionFilter) return false;
      return true;
    });

    filtered.forEach((unitId) => {
      const def = UnitDefinitions[unitId];
      const isUnlocked = this.playerProgress.isUnlocked(unitId);
      const isInDeck = this.playerProgress.isInDeck(unitId);

      const card = document.createElement("div");
      card.className = "collection-card";
      if (!isUnlocked) card.classList.add("locked");
      if (isInDeck) card.classList.add("in-deck");
      card.classList.add(`rarity-${def.rarity || 0}`);

      card.innerHTML = `
        <img src="${def.sprite}" alt="${def.name}" />
        <span class="collection-card-cost">${isUnlocked ? def.cost : ""}</span>
        ${!isUnlocked ? '<div class="lock-overlay">🔒</div>' : ""}
      `;

      if (isUnlocked) {
        card.addEventListener("click", () => {
          const mode =
            this.collectionFilter === "base"
              ? "base"
              : this.collectionFilter === "tower"
              ? "tower"
              : "unit";
          this.openModal(unitId, false, mode);
        });
      }

      this.el.collectionGrid.appendChild(card);
    });
  }

  renderBaseAndTowers() {
    const baseDef = UnitDefinitions[this.playerProgress.selectedBaseId];
    const leftDef = UnitDefinitions[this.playerProgress.selectedLeftTowerId];
    const rightDef = UnitDefinitions[this.playerProgress.selectedRightTowerId];

    this.el.baseSlot.innerHTML = baseDef
      ? `<img src="${baseDef.sprite}" alt="${baseDef.name}" /><span class="base-slot-label">Base</span>`
      : `<span class="base-slot-label">Base</span>`;

    this.el.leftTowerSlot.innerHTML = leftDef
      ? `<img src="${leftDef.sprite}" alt="${leftDef.name}" /><span class="tower-slot-label">Tour gauche</span>`
      : `<span class="tower-slot-label">Tour gauche</span>`;

    this.el.rightTowerSlot.innerHTML = rightDef
      ? `<img src="${rightDef.sprite}" alt="${rightDef.name}" /><span class="tower-slot-label">Tour droite</span>`
      : `<span class="tower-slot-label">Tour droite</span>`;

    // clic sur les slots pour ouvrir le détail
    if (baseDef) {
      this.el.baseSlot.onclick = () => this.openModal(baseDef.id, false, "base");
    }
    if (leftDef) {
      this.el.leftTowerSlot.onclick = () => this.openModal(leftDef.id, false, "tower-left");
    }
    if (rightDef) {
      this.el.rightTowerSlot.onclick = () => this.openModal(rightDef.id, false, "tower-right");
    }
  }

  openModal(unitId, isInDeck, mode = "unit") {
    const def = UnitDefinitions[unitId];
    if (!def) return;

    this.selectedUnitId = unitId;

    this.el.detailName.textContent = def.name;
    this.el.detailCost.textContent = `Coût: ${def.cost}`;
    this.el.detailSprite.src = def.sprite;
    this.el.detailDescription.textContent = def.description || "";
    this.el.detailHp.textContent = def.hp;
    this.el.detailDamage.textContent = def.damage;
    this.el.detailAtkSpeed.textContent = `${def.attackSpeed}/s`;
    this.el.detailRange.textContent = def.attackRange;
    this.el.detailMoveSpeed.textContent = def.movementSpeed;

    if (mode === "unit") {
      this.el.detailAction.textContent = isInDeck ? "Retirer du deck" : "Ajouter au deck";
      this.el.detailAction.onclick = () => {
        if (isInDeck) {
          this.playerProgress.removeFromDeck(unitId);
        } else {
          this.playerProgress.addToDeck(unitId);
        }
        this.closeModal();
        this.render();
      };
    } else if (mode === "base") {
      this.el.detailAction.textContent = "Utiliser comme base";
      this.el.detailAction.onclick = () => {
        this.playerProgress.setBase(unitId);
        this.closeModal();
        this.render();
      };
    } else if (mode === "tower") {
      this.el.detailAction.textContent = "Utiliser comme tour gauche";
      this.el.detailAction.onclick = () => {
        this.playerProgress.setLeftTower(unitId);
        this.closeModal();
        this.render();
      };
    } else if (mode === "tower-left") {
      this.el.detailAction.textContent = "Utiliser comme tour gauche";
      this.el.detailAction.onclick = () => {
        this.playerProgress.setLeftTower(unitId);
        this.closeModal();
        this.render();
      };
    } else if (mode === "tower-right") {
      this.el.detailAction.textContent = "Utiliser comme tour droite";
      this.el.detailAction.onclick = () => {
        this.playerProgress.setRightTower(unitId);
        this.closeModal();
        this.render();
      };
    }

    this.el.modalOverlay.classList.add("active");
  }

  closeModal() {
    this.el.modalOverlay.classList.remove("active");
    this.selectedUnitId = null;
  }
}

export { DEPLOYABLE_UNITS };