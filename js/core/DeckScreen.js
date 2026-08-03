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
  }

  render() {
    this.el.yangaAmount.textContent = this.playerProgress.yanga;
    this.renderDeckSlots();
    this.renderCollection();
    this.updateBattleButton();
  }

  renderDeckSlots() {
    this.el.deckSlots.innerHTML = "";

    for (let i = 0; i < 8; i++) {
      const unitId = this.playerProgress.deck[i];
      const slot = document.createElement("div");
      slot.className = "deck-slot";

      if (unitId) {
        const def = UnitDefinitions[unitId];
        slot.classList.add("filled");
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

    for (const unitId of DEPLOYABLE_UNITS) {
      const def = UnitDefinitions[unitId];
      if (!def) continue;

      const isUnlocked = this.playerProgress.isUnlocked(unitId);
      const isInDeck = this.playerProgress.isInDeck(unitId);

      const card = document.createElement("div");
      card.className = "collection-card";
      if (!isUnlocked) card.classList.add("locked");
      if (isInDeck) card.classList.add("in-deck");

      card.innerHTML = `
        <img src="${def.sprite}" alt="${def.name}" />
        <span class="collection-card-cost">${isUnlocked ? def.cost : ""}</span>
        ${!isUnlocked ? '<div class="lock-overlay">🔒</div>' : ""}
      `;

      card.addEventListener("click", () => {
        if (isUnlocked) this.openModal(unitId, isInDeck);
      });

      this.el.collectionGrid.appendChild(card);
    }
  }

  openModal(unitId, isInDeck) {
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

    this.el.modalOverlay.classList.add("active");
  }

  closeModal() {
    this.el.modalOverlay.classList.remove("active");
    this.selectedUnitId = null;
  }

  updateBattleButton() {
    const isComplete = this.playerProgress.isDeckComplete();
    this.el.battleBtn.disabled = !isComplete;
    this.el.battleBtn.classList.toggle("disabled", !isComplete);
  }
}

export { DEPLOYABLE_UNITS };