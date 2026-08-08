import { CampaignLevels } from "../config/campaignLevels.js";

const OBJECTIVE_ICONS = {
  destroyBase: "🏭",
  surviveWaves: "🌊"
};

const MAP_ICONS = {
  flat: "▦",
  middleWall: "▥",
  river: "〰"
};

export class CampaignScreen {
  constructor({
    playerProgress,
    elements,
    onLevelSelected,
    onBack
  }) {
    this.playerProgress = playerProgress;
    this.el = elements;
    this.onLevelSelected = onLevelSelected;
    this.onBack = onBack;

    this.el.backBtn.addEventListener("click", () => {
      this.onBack?.();
    });
  }

  render() {
    this.el.grid.innerHTML = "";

    for (const level of CampaignLevels) {
      const unlocked =
        level.unlockedByDefault ||
        this.playerProgress.isCampaignLevelUnlocked(level.id);

      const completed =
        this.playerProgress.isCampaignLevelCompleted(level.id);

      const card = document.createElement("button");
      card.className = "campaign-level-card";

      if (!unlocked) card.classList.add("locked");
      if (completed) card.classList.add("completed");

      card.disabled = !unlocked;

      card.innerHTML = `
        <span class="campaign-level-number">
          ${unlocked ? level.id : "🔒"}
        </span>

        <div class="campaign-level-main">
          <h3>${level.name}</h3>
          <p>${level.description}</p>
        </div>

        <div class="campaign-level-icons">
          <span title="${level.objective}">
            ${OBJECTIVE_ICONS[level.objective] || "?"}
          </span>
          <span title="${level.map}">
            ${MAP_ICONS[level.map] || "?"}
          </span>
        </div>

        ${
          completed
            ? `<span class="campaign-level-status">✓</span>`
            : ""
        }
      `;

      if (unlocked) {
        card.addEventListener("click", () => {
          this.onLevelSelected?.(level);
        });
      }

      this.el.grid.appendChild(card);
    }
  }
}