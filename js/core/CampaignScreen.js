import { CampaignLevels } from "../config/campaignLevels.js";
import { UnitDefinitions } from "../config/unitDefinitions.js";

const OBJECTIVE_ICONS = {
  destroyBase: "🏭",
  surviveWaves: "⏳",
  bossFight: "👹",
  dialog: "💬"
};

const MAP_ICONS = {
  flat: "🏞️",
  middleWall: "⛰️",
  river: "🌊"
};

// helpers
function getRewardMarkup(level, completed) {
  const reward = level.reward || {};
  const rewards = [];

  if (reward.yanga) {
    rewards.push(`
      <span class="campaign-reward-item">
        <img
          src="assets/ui/yanga.png"
          alt="Yanga"
          class="campaign-reward-yanga"
        >
        <span>${reward.yanga}</span>
      </span>
    `);
  }

  if (reward.chest) {
    const quantity = reward.chest.quantity || 1;

    rewards.push(`
      <span class="campaign-reward-item">
        <img
          src="assets/ui/${reward.chest.chestId}.png"
          alt="Coffre"
          class="campaign-reward-chest"
        >
        <span>${quantity > 1 ? `×${quantity}` : ""}</span>
      </span>
    `);
  }

  if (reward.unlockUnit) {
    const definition = UnitDefinitions[reward.unlockUnit];

    if (definition) {
      rewards.push(`
        <span
          class="campaign-reward-item campaign-reward-unit"
          title="Débloque : ${definition.name}"
        >
          <img
            src="${definition.sprite}"
            alt="${definition.name}"
            class="campaign-reward-unit-icon"
          >
        </span>
      `);
    }
  }

  if (!rewards.length) {
    return "";
  }

  return `
    <div class="campaign-rewards${completed ? " campaign-rewards-obtained" : ""}">
      <div class="campaign-rewards-list">
        ${rewards.join("")}
      </div>
    </div>
  `;
}

function getObjectiveMarkup(level) {
  if (level.objective === "dialog") {
    const firstDialog = level.dialogs?.[0];

    if (firstDialog?.sprite) {
       const spriteColor = level.spriteColor || "#ffffff";

      return `
        <span class="campaign-dialog-character" style="--dialog-sprite-color: ${spriteColor};">
          <span class="campaign-dialog-character-fade"></span>

          <img
            src="${firstDialog.sprite}"
            alt="${firstDialog.character || "Personnage"}"
            class="campaign-dialog-character-sprite"
          >
        </span>
      `;
    }

    return `<span>💬</span>`;
  }

  return `
    <span>
      ${OBJECTIVE_ICONS[level.objective] || "❓"}
    </span>
  `;
}

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

          ${getRewardMarkup(level, completed)}
        </div>

        <span class="campaign-level-icons">
          ${getObjectiveMarkup(level)}

          ${
            level.objective !== "dialog"
              ? `<span title="${level.map}">
                  <span>${MAP_ICONS[level.map] || "▦"}</span>
                </span>`
              : ""
          }
        </span>

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