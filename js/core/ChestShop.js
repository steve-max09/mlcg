import { ChestDefinitions } from "../config/chestDefinitions.js";
import { ChestSystem } from "./ChestSystem.js";

const RARITY_LABELS = { 0: "Commune", 1: "Rare", 2: "Ultra-rare" };

export class ChestShop {
  constructor({ playerProgress, elements, audioManager, uiSounds, onBack }) {
    this.playerProgress = playerProgress;
    this.el = elements;
    this.audioManager = audioManager;
    this.uiSounds = uiSounds;
    this.onBack = onBack;

    this.bindEvents();
  }

  bindEvents() {
    this.el.backBtn.addEventListener("click", () => {
      this.playSound();
      if (this.onBack) this.onBack();
    });
  }

  playSound() {
    if (this.audioManager && this.uiSounds) {
      this.audioManager.play(this.uiSounds.buttonClick);
    }
  }

  render() {
    this.el.yangaDisplay.textContent = this.playerProgress.yanga;
    this.renderShopGrid();
  }

  renderShopGrid() {
    this.el.shopGrid.innerHTML = "";

    Object.values(ChestDefinitions).forEach((chest) => {
      const canAfford = this.playerProgress.yanga >= chest.price;

      const card = document.createElement("div");
      card.className = "chest-shop-card";
      card.innerHTML = `
        <img src="${chest.sprite}" alt="${chest.name}" />
        <span class="chest-shop-name">${chest.name}</span>
        <button class="menu-btn small ${canAfford ? "primary" : "disabled"}" ${canAfford ? "" : "disabled"}>
          <img src="assets/ui/yanga.png" class="yanga-icon-small" alt="" /> ${chest.price}
        </button>
      `;

      const buyBtn = card.querySelector("button");
      buyBtn.addEventListener("click", () => {
        this.playSound();
        if (this.playerProgress.buyChest(chest.id, chest.price)) {
          this.render();
          if (this.onChestBought) this.onChestBought();
        }
      });

      this.el.shopGrid.appendChild(card);
    });
  }
}

export { RARITY_LABELS };