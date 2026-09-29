import { ItemDefinitions } from "../config/itemDefinitions.js";

export class ItemsScreen {
  constructor({
    playerProgress,
    elements,
    onBack,
    onItemSelected
  }) {
    this.playerProgress = playerProgress;
    this.el = elements;
    this.onBack = onBack;
    this.onItemSelected = onItemSelected;

    this.el.backBtn.addEventListener("click", () => this.onBack?.());
  }

  render() {
    this.el.grid.innerHTML = "";

    Object.values(ItemDefinitions).forEach(
      (item) => {
        const quantity = this.playerProgress.getItemQuantity(item.id);

        if (quantity <= 0) return;

        const card = document.createElement("div");

        const rarity = item.rarity;

        card.className = `item-card rarity-${rarity}`;

        card.innerHTML = `
          <img src="${item.sprite}" alt="${item.name}">
          <div class="item-card-quantity">×${quantity}</div>
        `;

        card.addEventListener("click", () => {
            this.onItemSelected?.(item.id);
        });

        this.el.grid.appendChild(card);
      }
    );
  }
}