import { ChestDefinitions } from "../config/chestDefinitions.js";
import { UiSounds } from "../config/uiSounds.js";
import { ChestSystem } from "./ChestSystem.js";

const RARITY_LABELS = { 0: "Commun", 1: "Rare", 2: "Ultra-rare" };

export class ChestOpener {
  constructor({ playerProgress, elements, audioManager, uiSounds, onResolved }) {
    this.playerProgress = playerProgress;
    this.el = elements;
    this.audioManager = audioManager;
    this.uiSounds = uiSounds;
    this.onResolved = onResolved;

    this.el.closeBtn.addEventListener("click", () => {
      this.close();
    });
  }

  openChest(instanceId, chestId) {
    const chestDef = ChestDefinitions[chestId];
    if (!chestDef) return;

    this.currentInstanceId = instanceId;

    this.el.overlay.classList.add("active");
    this.el.chestSprite.src = chestDef.sprite;
    this.el.chestSprite.classList.remove("hidden");
    this.el.reveal.classList.remove("revealed");
    this.el.closeBtn.classList.add("hidden");

    this.el.chestSprite.classList.add("shaking");

    setTimeout(() => {
      this.el.chestSprite.classList.remove("shaking");
      this.el.chestSprite.classList.add("hidden");

      const reward = ChestSystem.open(chestDef, this.playerProgress);
      this.playerProgress.removeChest(instanceId);

      if (reward) {
        this.el.revealSprite.src = reward.definition.sprite;

        this.el.revealName.textContent = reward.type === "item"
            ? `${reward.definition.name}`
            : reward.definition.name;

        this.el.revealRarity.textContent = reward.type === "item"
            ? `${RARITY_LABELS[reward.definition.rarity]}`
            : RARITY_LABELS[reward.definition.rarity];

        this.el.revealRarity.className = `rarity-label rarity-${reward.definition.rarity}`;
      }

      this.el.reveal.classList.add("revealed", "burst");
      this.el.closeBtn.classList.remove("hidden");
    }, 1400);
  }

  close() {
    this.el.overlay.classList.remove("active");
    this.el.reveal.classList.remove("burst");
    if (this.onResolved) this.onResolved();
  }
}