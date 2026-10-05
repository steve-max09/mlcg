import { UnitDefinitions } from "../config/unitDefinitions.js";
import { MAX_DECK_SIZE } from "./PlayerProgress.js";
import { ItemDefinitions } from "../config/itemDefinitions.js";

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
  "mat",
  "fendeuse"
];

export class DeckScreen {
  constructor({ playerProgress, elements, onBattleStart, onBack, onEquipmentChanged }) {
    this.playerProgress = playerProgress;
    this.el = elements;
    this.onBattleStart = onBattleStart;
    this.onBack = onBack;
    this.onEquipmentChanged = onEquipmentChanged;
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

    for (let i = 0; i < MAX_DECK_SIZE; i++) {
      const unitId = this.playerProgress.deck[i];
      const slot = document.createElement("div");

      slot.className = "deck-slot";

      if (!unitId) {
        slot.classList.add("empty");
        slot.innerHTML = "+";
        this.el.deckSlots.appendChild(slot);
        continue;
      }

      const def = UnitDefinitions[unitId];
      const equippedItemId = this.playerProgress.getEquippedItem(unitId);
      const equippedItem = equippedItemId ? ItemDefinitions[equippedItemId] : null;

      slot.classList.add("filled", `rarity-${def.rarity}`);

      slot.innerHTML = `
        <img src="${def.sprite}" alt="${def.name}">
        ${equippedItem ? `
          <span class="deck-equipped-item rarity-${equippedItem.rarity}">
            <img src="${equippedItem.sprite}" alt="${equippedItem.name}">
          </span>
        ` : ""}
        <span class="deck-slot-cost">${def.cost}</span>
      `;

      slot.addEventListener("click", () => {
        this.openModal(unitId, true, "unit");
      });

      this.el.deckSlots.appendChild(slot);
    }

    this.el.collectionCount.textContent =
      `${this.playerProgress.deck.length}/${MAX_DECK_SIZE}`;
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

      const equippedItemId = this.playerProgress.getEquippedItem(unitId);
      const equippedItem = equippedItemId ? ItemDefinitions[equippedItemId] : null;

      const card = document.createElement("div");
      card.className = "collection-card";
      if (!isUnlocked) card.classList.add("locked");
      if (isInDeck) card.classList.add("in-deck");
      card.classList.add(`rarity-${def.rarity || 0}`);

      card.innerHTML = `
        <img src="${def.sprite}" alt="${def.name}" />
        ${equippedItem ? `
          <span class="deck-equipped-item rarity-${equippedItem.rarity}">
            <img src="${equippedItem.sprite}" alt="${equippedItem.name}">
          </span>
        ` : ""}
        <span class="collection-card-cost">${isUnlocked ? def.cost || "" : ""}</span>
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
    const baseDef = UnitDefinitions[this.playerProgress.playerBaseId];
    const leftDef = UnitDefinitions[this.playerProgress.playerLeftTowerId];
    const rightDef = UnitDefinitions[this.playerProgress.playerRightTowerId];

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
      this.el.leftTowerSlot.onclick = () => this.openModal(leftDef.id, false, "tower");
    }
    if (rightDef) {
      this.el.rightTowerSlot.onclick = () => this.openModal(rightDef.id, false, "tower");
    }
  }

  // ajoute les infos de bonus d'équipements dans les stats de la carte
  setStatValue(element, baseValue, delta = 0, suffix = "") {
    if (!element) return;

    const hasDelta = delta !== 0;
    const deltaClass = delta > 0 ? "stat-bonus" : "stat-malus";
    const deltaText = delta > 0 ? `+${delta}` : `${delta}`;

    element.innerHTML = `
      <span class="stat-base-value">${baseValue}${suffix}</span>
      ${ hasDelta ? `<span class="${deltaClass}">${deltaText}${suffix}</span>` : "" }
    `;
  }

  getUnitItemEffects(unitId) {
    const itemId = this.playerProgress.getEquippedItem(unitId);

    const item = itemId ? ItemDefinitions[itemId] : null;

    return item?.effects || {};
  }

  // calcul du coût de l'unité après réduction (on ne descend pas en-dessous de 2)
  getUnitCostDelta(def, effects = {}) {
    const baseCost = def.cost || 0;
    const rawDelta = (effects.unitCostIncrease || 0) - (effects.unitCostReduction || 0);

    const finalCost = Math.max(2, baseCost + rawDelta);

    return finalCost - baseCost;
  }

  openModal(unitId, isInDeck, mode = "unit") {
    const def = UnitDefinitions[unitId];
    if (!def) return;

    this.selectedUnitId = unitId;
    this.resetModalFields();

    this.el.detailName.textContent = def.name;
    this.el.detailSprite.src = def.sprite;
    this.el.detailDescription.textContent = def.description || "Description manquante";

    const effects = mode === "unit" ? this.getUnitItemEffects(unitId) : {};
    const costDelta = this.getUnitCostDelta(def, effects);

    this.setStatValue(this.el.detailCost, `Coût: ${def.cost}`, costDelta);
    this.setStatValue(this.el.detailHp, def.hp, effects.hpBoost || 0);

    this.setStatValue(this.el.detailArmor, def.armor || 0, effects.armor || 0);

    const baseDamage = def.continuousAttack?.damagePerSecond ?? def.damage;
    const damageDelta = def.continuousAttack ? effects.damageBoost || 0 : effects.damageBoost || 0;
    this.setStatValue(this.el.detailDamage, baseDamage, damageDelta, def.continuousAttack ? "/s" : "");

    this.setStatValue(this.el.detailAtkSpeed, def.attackSpeed, effects.attackSpeedBoost || 0, "/s");
    this.setStatValue(this.el.detailRange, def.attackRange, effects.attackRangeBoost || 0);
    this.setStatValue(this.el.detailMoveSpeed, def.movementSpeed, effects.movementSpeedBoost || 0);

    if (mode === "unit") {
      const equippedItemId = this.playerProgress.getEquippedItem(unitId);

      const equippedItem = equippedItemId ? ItemDefinitions[equippedItemId] : null;

      this.showUnitStats();

      this.el.detailAction.style.display = "block";
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

      if (equippedItem) {
        this.el.detailActionLeft.style.display = "block";

        this.el.detailActionLeft.textContent = "Retirer l'équipement";

        this.el.detailActionLeft.onclick = () => {
          this.playerProgress.unequipItem(unitId);
          this.closeModal();
          this.render();
        };
      }
    }

    if (mode === "base") {
      this.showUnitStats();
      this.hideCostAndMoveSpeed();

      this.el.detailAction.style.display = "block";
      this.el.detailAction.textContent = "Utiliser comme base";

      this.el.detailAction.onclick = () => {
        this.playerProgress.setPlayerBase(unitId);
        this.closeModal();
        this.render();
      };
    }

    if (mode === "tower") {
      this.showUnitStats();
      this.hideCostAndMoveSpeed();

      this.el.detailAction.style.display = "none";
      this.el.detailActionLeft.style.display = "block";
      this.el.detailActionRight.style.display = "block";

      this.el.detailActionLeft.textContent = "Utiliser comme tour gauche";

      this.el.detailActionRight.textContent = "Utiliser comme tour droite";

      this.el.detailActionLeft.onclick = () => {
        this.playerProgress.setPlayerLeftTower(unitId);
        this.closeModal();
        this.render();
      };

      this.el.detailActionRight.onclick = () => {
        this.playerProgress.setPlayerRightTower(unitId);
        this.closeModal();
        this.render();
      };
    }

    this.el.modalOverlay.classList.add("active");
  }

  showCostAndMoveSpeed() {
    this.el.detailCost.style.display = "";
    this.el.detailMoveSpeed.style.display = "";

    this.el.detailCost.parentElement.style.display = "flex";
    this.el.detailMoveSpeed.parentElement.style.display = "flex";
  }

  hideCostAndMoveSpeed() {
    this.el.detailCost.style.display = "none";
    this.el.detailMoveSpeed.style.display = "none";

    this.el.detailCost.parentElement.style.display = "none";
    this.el.detailMoveSpeed.parentElement.style.display = "none";
  }

  resetModalFields() {
    this.showCostAndMoveSpeed();

    const statParents = [
      this.el.detailCost,
      this.el.detailHp,
      this.el.armor,
      this.el.detailDamage,
      this.el.detailAtkSpeed,
      this.el.detailRange,
      this.el.detailMoveSpeed
    ];

    statParents.forEach((element) => {
      if (element?.parentElement) {
        element.parentElement.style.display = "flex";
      }
    });

    if (this.el.unitDetailStats) {
      this.el.unitDetailStats.style.display = "block";
    }

    this.el.detailAction.style.display = "none";
    this.el.detailActionLeft.style.display = "none";
    this.el.detailActionRight.style.display = "none";

    if (this.el.itemDetailEffects) {
      this.el.itemDetailEffects.innerHTML = "";
      this.el.itemDetailEffects.style.display = "none";
    }
  }

  showUnitStats() {
    this.el.unitDetailStats.style.display = "block";
    this.showCostAndMoveSpeed();

    const statParents = [
      this.el.detailCost,
      this.el.detailHp,
      this.el.armor,
      this.el.detailDamage,
      this.el.detailAtkSpeed,
      this.el.detailRange,
      this.el.detailMoveSpeed
    ];

    statParents.forEach((element) => {
      if (element?.parentElement) {
        element.parentElement.style.display = "flex";
      }
    });
  }

  hideUnitStats() {
    if (this.el.unitDetailStats) {
      this.el.unitDetailStats.style.display = "none";
    }
  }

  closeModal() {
    this.el.modalOverlay.classList.remove("active");
    this.selectedUnitId = null;
  }

  // modal de détails des items ===
  openItemModal(itemId) {
    const item = ItemDefinitions[itemId];
    if (!item) return;

    const quantity = this.playerProgress.getItemQuantity(itemId);

    this.resetModalFields();
    this.hideUnitStats();
    this.hideCostAndMoveSpeed();

    this.el.detailName.textContent = item.name;
    this.el.detailSprite.src = item.sprite;
    this.el.detailDescription.textContent = item.description || "Description manquante";

    this.renderItemEffects(item.effects);

    this.el.detailAction.style.display = "block";
    this.el.detailAction.textContent = `Équiper · ${quantity} disponible${quantity > 1 ? "s" : ""}`;

    this.el.detailAction.onclick = () => {
      this.openEquipUnitPicker(itemId);
    };

    this.el.modalOverlay.classList.add("active");
  }

  openEquipUnitPicker(itemId) {
    const unlockedUnits = this.playerProgress.unlockedUnits
        .map((unitId) => ({
          id: unitId,
          definition: UnitDefinitions[unitId]
        }))
        .filter((entry) =>
          entry.definition?.category === "unit"
        );

    this.el.detailDescription.innerHTML = `
      <div class="equip-picker">
        <p>Choisir une unité :</p>
        ${unlockedUnits.map((entry) => `
          <button class="equip-unit-option" data-unit-id="${entry.id}">
            <span>${entry.definition.name}</span>
            <img src="${entry.definition.sprite}" alt="${entry.definition.name}">
          </button>
        `).join("")}
      </div>
    `;

    this.el.modalOverlay
      .querySelectorAll(".equip-unit-option")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const unitId = button.dataset.unitId;
          const success = this.playerProgress.equipItem(unitId, itemId);

          if (!success) return;

          this.closeModal();
          this.render();
          this.onEquipmentChanged?.();
        });
      });
  }

  renderItemEffects(effects = {}) {
    const labels = {
      hpBoost: "PV",
      armor: "Armure",
      attackSpeedBoost: "Vitesse d'attaque",
      movementSpeedBoost: "Vitesse",
      damageBoost: "Dégâts",
      unitCostReduction: "Réduction du coût",
      unitCostIncrease: "Augmentation du coût",
      passiveDamageArea: "Zone de décharge",
      passiveDamageTick: "Fréquence",
      passiveDamage: "Intensité",
      passiveHeal: "Autoréparation",
      lifesteal: "Absorption de PV",
      targetTypeChange: "Cible"
    };

    const values = {
      hpBoost: (value) => `+${value}`,
      armor: (value) => `+${value}`,
      attackSpeedBoost: (value) => `+${value}`,
      movementSpeedBoost: (value) => `+${value}`,
      damageBoost: (value) => `+${value}`,
      unitCostReduction: (value) => `-${value}`,
      unitCostIncrease: (value) => `+${value}`,
      targetTypeChange: (value) => value === "buildings" ? "Bâtiments" : value === "ground" ? "Ennemis" : "Tous",
    };

    if (!this.el.itemDetailEffects) return;

    const entries = Object.entries(effects);

    this.el.itemDetailEffects.innerHTML = entries
      .map(([key, value]) => `
        <div class="item-effect-row">
          <span>${labels[key] || key}</span>
          <strong>${values[key]?.(value) || value}</strong>
        </div>
      `)
      .join("");

    this.el.itemDetailEffects.style.display = entries.length ? "block" : "none";
  }
  // ===
}

export { DEPLOYABLE_UNITS };