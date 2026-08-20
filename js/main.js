import { GameState } from "./core/GameState.js";
import { Unit } from "./core/Unit.js";
import { Tower } from "./core/Tower.js";
import { GameLoop } from "./core/GameLoop.js";
import { Renderer } from "./render/Renderer.js";
import { DragDropController } from "./input/DragDropController.js";
import { UnitDefinitions } from "./config/unitDefinitions.js";

import { AIController } from "./core/AIController.js";

import { AudioManager } from "./core/AudioManager.js";
import { UiSounds } from "./config/uiSounds.js";

import { AnimationSystem } from "./core/AnimationSystem.js";
import { AbilitySystem } from "./core/AbilitySystem.js";

import { PlayerProgress } from "./core/PlayerProgress.js";
import { DeckScreen } from "./core/DeckScreen.js";

import { ChestShop } from "./core/ChestShop.js";
import { ChestOpener } from "./core/ChestOpener.js";
import { ChestDefinitions } from "./config/chestDefinitions.js";

import { CampaignLevels } from "./config/campaignLevels.js";
import { CampaignScreen } from "./core/CampaignScreen.js";
import { CampaignWaveController } from "./core/CampaignWaveController.js";
import { DialogController } from "./core/DialogController.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").then((registration) => {
      registration.update();

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: "SKIP_WAITING" });
            window.location.reload();
          }
        });
      });
    });
  });
}
// === end imports and app setup stuff ===

// === audioManager ===
const audioManager = new AudioManager();
audioManager.uiSounds = UiSounds;

Object.values(UiSounds).forEach((src) => audioManager.preload(src));
Object.values(UnitDefinitions).forEach((def) => {
  if (def.sounds) Object.values(def.sounds).forEach((src) => audioManager.preload(src));
});
// === end audioManager ===

// VARIABLES
let isCampaignRun = false;
let activeCampaignLevel = null;
let campaignTimer = 0;
let campaignMode = null; // "destroyBase" | "surviveWaves"

const playerProgress = new PlayerProgress();

const deckScreen = new DeckScreen({
  playerProgress,
  elements: {
    backBtn: document.getElementById("deck-back-btn"),
    battleBtn: document.getElementById("battle-btn"),
    yangaAmount: document.getElementById("yanga-amount"),
    deckSlots: document.getElementById("deck-slots"),
    baseSlot: document.getElementById("base-slot"),
    leftTowerSlot: document.getElementById("left-tower-slot"),
    rightTowerSlot: document.getElementById("right-tower-slot"),
    filterUnitsBtn: document.getElementById("filter-units-btn"),
    filterTowersBtn: document.getElementById("filter-towers-btn"),
    filterBasesBtn: document.getElementById("filter-bases-btn"),
    collectionGrid: document.getElementById("collection-grid"),
    collectionCount: document.getElementById("collection-count"),
    modalOverlay: document.getElementById("unit-detail-modal"),
    modalClose: document.getElementById("unit-detail-close"),
    detailName: document.getElementById("unit-detail-name"),
    detailCost: document.getElementById("unit-detail-cost"),
    detailSprite: document.getElementById("unit-detail-sprite"),
    detailDescription: document.getElementById("unit-detail-description"),
    detailHp: document.getElementById("unit-detail-hp"),
    detailDamage: document.getElementById("unit-detail-damage"),
    detailAtkSpeed: document.getElementById("unit-detail-atkspeed"),
    detailRange: document.getElementById("unit-detail-range"),
    detailMoveSpeed: document.getElementById("unit-detail-movespeed"),
    detailAction: document.getElementById("unit-detail-action"),
    detailActionLeft: document.getElementById("unit-detail-action-left"),
    detailActionRight: document.getElementById("unit-detail-action-right")
  },
  onBattleStart: () => {
    audioManager.play(UiSounds.startFreeBattle)
    startBattleWithDeck(playerProgress.deck);
  },
  onBack: () => showScreen("main-menu")
});

document.getElementById("open-deck-btn").addEventListener("click", () => {
  audioManager.play(UiSounds.buttonClick);
  showScreen("deck-screen");
  deckScreen.render();
  renderOwnedChests();
});

const mainMenu = document.getElementById("main-menu");
const arenaScreen = document.getElementById("arena-screen");
const victoryScreen = document.getElementById("victory-screen");
const arenaElement = document.getElementById("arena");
const playBtn = document.getElementById("playBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");
const victoryTitle = document.getElementById("victoryTitle");
const victorySubtitle = document.getElementById("victorySubtitle");
const energyValue = document.getElementById("energyValue");
const energyFill = document.getElementById("energyFill");
const handContainer = document.getElementById("handContainer");
// timer pour le mode survie (surviveWaves)
const campaignTimerEl = document.getElementById("campaign-timer");

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function setupArena(gameState, renderer, playerProgress, options = {}) {
  const arenaRect = arenaElement.getBoundingClientRect();
  const centerX = arenaRect.width / 2;

  const offsetX = arenaRect.width * 0.22; // distance latérale depuis le centre
  const enemyY = arenaRect.height * 0.30;
  const playerY = arenaRect.height * 0.76;

  if (!options.noEnemyStructures) {
    // Base et tours ennemies (définies dans campaignLevels.js)
    const enemyStructures = options.enemyStructures || {};

    const enemyBaseId = enemyStructures.baseId || playerProgress.enemyBaseId || "base_usine";
    const enemyLeftTowerId = enemyStructures.leftTowerId || playerProgress.enemyLeftTowerId || "tower_standard";
    const enemyRightTowerId = enemyStructures.rightTowerId || playerProgress.enemyRightTowerId || "tower_standard";

    const enemyBaseDef = UnitDefinitions[enemyBaseId] || UnitDefinitions.base_usine;
    const enemyLeftDef = UnitDefinitions[enemyLeftTowerId] || UnitDefinitions.tower_standard;
    const enemyRightDef = UnitDefinitions[enemyRightTowerId] || UnitDefinitions.tower_standard;

    const enemyBase = new Tower(enemyBaseDef, "enemy", centerX, arenaRect.height * 0.10);
    const enemyLeftTower = new Tower(enemyLeftDef, "enemy", centerX - offsetX, enemyY);
    const enemyRightTower = new Tower(enemyRightDef, "enemy", centerX + offsetX, enemyY);

    gameState.addTower(enemyBase);
    gameState.addTower(enemyLeftTower);
    gameState.addTower(enemyRightTower);
  }

  // Base joueur
  const playerBaseDef = UnitDefinitions[playerProgress.playerBaseId] || UnitDefinitions.base_usine;
  const playerBase = new Tower(playerBaseDef, "player", centerX, arenaRect.height * 0.92);
  gameState.addTower(playerBase);

  // Tours joueur
  const playerLeftDef = UnitDefinitions[playerProgress.playerLeftTowerId] || UnitDefinitions.tower_standard;
  const playerRightDef = UnitDefinitions[playerProgress.playerRightTowerId] || UnitDefinitions.tower_standard;

  const playerLeftTower = new Tower(playerLeftDef, "player", centerX - offsetX, playerY);
  const playerRightTower = new Tower(playerRightDef, "player", centerX + offsetX, playerY);

  gameState.addTower(playerLeftTower);
  gameState.addTower(playerRightTower);
}

function getArenaSize() {
  const rect = arenaElement.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function updateEnergyUI() {
  const ratio = (gameState.energy / gameState.maxEnergy) * 100;
  energyFill.style.width = `${ratio}%`;
  energyValue.textContent = `${gameState.energy}/${gameState.maxEnergy}`;

  document.querySelectorAll(".card").forEach((cardEl) => {
    const unitId = cardEl.dataset.unitId;
    const def = UnitDefinitions[unitId];
    if (!def) return;
    cardEl.classList.toggle("disabled", !gameState.canAfford(def.cost));
  });
}

function handleGameOver(winner) {
  if (campaignMode === "surviveWaves") {
    audioManager.play(winner === "player" ? UiSounds.victory : UiSounds.defeat);
    victoryTitle.textContent = winner === "player" ? "Victoire !" : "Défaite";
    victorySubtitle.textContent =
    winner === "player"
      ? "Vous avez survécu."
      : "Vous n'avez pas survécu.";
  } else if (campaignMode === "dialog") {
    victoryTitle.textContent = "";
    victorySubtitle.textContent = "À méditer...";
  } else if (campaignMode === "bossFight") {
    audioManager.play(winner === "player" ? UiSounds.bigVictory : UiSounds.defeat);
    victoryTitle.textContent = winner === "player" ? "Victoire !" : "Défaite";
    victorySubtitle.textContent =
    winner === "player"
      ? "Boss vaincu !"
      : "Votre base a été détruite.";
  } else {
    audioManager.play(winner === "player" ? UiSounds.victory : UiSounds.defeat);
    victoryTitle.textContent = winner === "player" ? "Victoire !" : "Défaite";
    victorySubtitle.textContent =
    winner === "player"
      ? "La base ennemie est détruite !"
      : "Votre base a été détruite.";
  }

  if (winner === "player" && activeCampaignLevel) {
    const levelIndex = CampaignLevels.findIndex(
      (level) => level.id === activeCampaignLevel.id
    );

    const nextLevel = CampaignLevels[levelIndex + 1];

    if (!playerProgress.isCampaignLevelCompleted(activeCampaignLevel.id)) {
      const rewardResult = playerProgress.claimCampaignReward(activeCampaignLevel);

      if (rewardResult?.unlockedUnitId) {
        audioManager.play(UiSounds.unlockNew);
        showCampaignUnlockModal(rewardResult.unlockedUnitId);
      }
    }
  } else if (winner === "player") {
    playerProgress.addYanga(50);
  }

  showScreen("victory-screen");
}

const gameState = new GameState();
const renderer = new Renderer(arenaElement);

const aiController = new AIController({
  gameState,
  unitDefinitions: UnitDefinitions,
  difficultyConfig: {},
  onSpawn: (definition, x, y) => {
    spawnUnit(definition, "enemy", x, y);
    updateEnergyUI();
  }
});

// contrôleur pour les vagues
const campaignWaveController = new CampaignWaveController({
  gameState,
  unitDefinitions: UnitDefinitions,
  onSpawn: (definition, x, y, options) => {
    spawnUnit(definition, "enemy", x, y, options);
  },
  onWaveStart: () => {},
  onWaveEnd: () => {},
  onBossSpawn: (definition, x, y) => {
    spawnUnit(definition, "enemy", x, y, {isBoss: true});
  }
});

// === timer pour le mode surviveWaves ===
function updateCampaignTimer(deltaSeconds) {
  if (campaignMode !== "surviveWaves") {
    campaignTimerEl.textContent = "";
    campaignTimerEl.style.display = "none";
    return;
  }

  campaignTimer = Math.max(0, campaignTimer - deltaSeconds);
  campaignTimerEl.style.display = "block";
  campaignTimerEl.textContent = formatTimer(campaignTimer);

  if (campaignTimer <= 0 && !gameState.isGameOver) {
    gameState.isGameOver = true;
    gameState.winner = "player";
  }
}

function formatTimer(seconds) {
  const total = Math.ceil(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
// === end timer pour le mode surviveWaves ===

// === contrôleur pour les dialogues ===
const dialogController = new DialogController({
  overlay: document.getElementById("dialog-overlay"),
  sprite: document.getElementById("dialog-sprite"),
  character: document.getElementById("dialog-character"),
  text: document.getElementById("dialog-text"),
  continueButton: document.getElementById("dialog-continue"),
  onComplete: completeDialogLevel
});

function completeDialogLevel() {
  if (!activeCampaignLevel || gameState.isGameOver) { return; }

  dialogController.close();

  gameState.isGameOver = true;
  gameState.winner = "player";

  handleGameOver("player");
}
// === end contrôleur pour les dialogues ===

const gameLoop = new GameLoop({
  gameState,
  renderer,
  onEnergyChange: updateEnergyUI,
  onGameOver: handleGameOver,
  aiController,
  audioManager,
  campaignWaveController,
  updateCampaignTimer,
  onCampaignComplete: checkCampaignCompletion
});

const dragDropController = new DragDropController({
  arenaElement,
  gameState,
  unitDefinitions: UnitDefinitions,
  onSpawn: (definition, x, y) => {
    spawnUnit(definition, "player", x, y);
    updateEnergyUI();
  }
});

playBtn.addEventListener("click", () => {
  audioManager.play(UiSounds.startFreeBattle)
  startBattleWithDeck(playerProgress.deck);
});

// figer la hauteur =======
function lockViewportHeight() {
  const setHeight = () => {
    document.documentElement.style.setProperty(
      "--app-height",
      `${window.innerHeight}px`
    );
  };

  setHeight();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setHeight, 300);
  });
}

lockViewportHeight();
// ========================

// pour jouer avec le deck choisi
function renderHand(deck) {
  const handEl = document.querySelector(".hand");
  handEl.innerHTML = "";

  deck.forEach((unitId) => {
    const definition = UnitDefinitions[unitId];
    if (!definition) return;

    const card = document.createElement("button");
    card.className = `card rarity-${definition.rarity}`;
    card.dataset.unitId = unitId;
    card.innerHTML = `
      <img src="${definition.sprite}" alt="${definition.name}" />
      <span class="card-cost">${definition.cost}</span>
    `;

    dragDropController.bindCard(card, unitId);
    handEl.appendChild(card);
  });
}

// non-campaign battle
function clearArenaVisuals() {
  arenaElement
    .querySelectorAll(
      ".game-unit, .game-tower"
    )
    .forEach((element) => {
      element.remove();
    });
}

function resetBattleState() {
  gameLoop.stop();

  dialogController.close();
  clearArenaVisuals();

  gameState.reset();
  campaignWaveController.reset();

  aiController.configure({
    decisionInterval: 999999,
    startingEnergy: 0,
    energyRegenRate: 0,
    energyRegenInterval: 999999,
    unitPool: []
  });

  isCampaignRun = false;
  activeCampaignLevel = null;
  campaignMode = null;
  campaignTimer = 0;

  campaignTimerEl.textContent = "";
  campaignTimerEl.style.display = "none";

  arenaElement.dataset.map = "";
  arenaElement.dataset.objective = "";
}

function startBattleWithDeck(deck) {
  resetBattleState();

  isCampaignRun = false;
  activeCampaignLevel = null;
  campaignMode = null;

  showScreen("arena-screen");

  requestAnimationFrame(() => {
    renderHand(deck);

    setupArena(gameState, renderer, playerProgress, {
      enemyStructures: getRandomEnemyStructures()
    });

    configureNormalBattleAI();

    gameLoop.start();
  });
}
// =====

// === CHESTS ===
const chestOpener = new ChestOpener({
  playerProgress,
  elements: {
    overlay: document.getElementById("chest-open-modal"),
    chestSprite: document.getElementById("chest-open-sprite"),
    reveal: document.getElementById("chest-reveal"),
    revealSprite: document.getElementById("chest-reveal-sprite"),
    revealName: document.getElementById("chest-reveal-name"),
    revealRarity: document.getElementById("chest-reveal-rarity"),
    closeBtn: document.getElementById("chest-reveal-close")
  },
  audioManager,
  uiSounds: UiSounds,
  onResolved: () => {
    renderOwnedChests();
    deckScreen.render();
    renderOwnedChests();
  }
});

// reward modal
const campaignRewardModal = document.getElementById("campaign-reward-modal");
const campaignRewardSprite = document.getElementById("campaign-reward-sprite");
const campaignRewardName = document.getElementById("campaign-reward-name");
const campaignRewardDescription = document.getElementById("campaign-reward-description");
const campaignRewardClose = document.getElementById("campaign-reward-close");

function showCampaignUnlockModal(unitId) {
  const definition = UnitDefinitions[unitId];

  if (!definition) return;

  campaignRewardSprite.src = definition.sprite;
  campaignRewardSprite.alt = definition.name;
  campaignRewardName.textContent = definition.name;
  campaignRewardDescription.textContent =
    definition.description || "Cette unité est maintenant disponible.";

  campaignRewardModal.classList.add("active");
}

campaignRewardClose.addEventListener("click", () => {
  campaignRewardModal.classList.remove("active");
});

const chestShop = new ChestShop({
  playerProgress,
  elements: {
    backBtn: document.getElementById("chest-shop-back-btn"),
    yangaDisplay: document.getElementById("chest-shop-yanga"),
    shopGrid: document.getElementById("chest-shop-grid")
  },
  audioManager,
  uiSounds: UiSounds,
  onBack: () => {
    showScreen("deck-screen");
    deckScreen.render();
    renderOwnedChests();
  }
});
chestShop.onChestBought = () => renderOwnedChests();

document.getElementById("open-chests-btn").addEventListener("click", () => {
  audioManager.play(UiSounds.buttonClick);
  showScreen("chest-shop-screen");
  chestShop.render();
});

function renderOwnedChests() {
  const row = document.getElementById("owned-chests-row");
  row.innerHTML = "";

  row.classList.toggle("empty", playerProgress.ownedChests.length === 0);

  playerProgress.ownedChests.forEach((chest) => {
    const def = ChestDefinitions[chest.chestId];
    if (!def) return;

    const el = document.createElement("button");
    el.className = "owned-chest";
    el.innerHTML = `<img src="${def.sprite}" alt="${def.name}" />`;
    el.addEventListener("click", () => {
      audioManager.play(UiSounds.openChest);
      setTimeout(() => {
        audioManager.play(UiSounds.unlockNew);
      }, 1200)
      chestOpener.openChest(chest.instanceId, chest.chestId);
    });

    row.appendChild(el);
  });
}
// === end CHESTS ===

// === CAMPAIGN ===
const campaignScreen = new CampaignScreen({
  playerProgress,
  elements: {
    grid: document.getElementById("campaign-level-grid"),
    backBtn: document.getElementById("campaign-back-btn")
  },
  onLevelSelected: (level) => {
    startCampaignBattle(level);
  },
  onBack: () => {
    showScreen("main-menu");
  }
});

document
  .getElementById("open-campaign-btn")
  .addEventListener("click", () => {
    audioManager.play(UiSounds.buttonClick);
    showScreen("campaign-screen");
    campaignScreen.render();
  });

function startCampaignBattle(level) {
  resetBattleState();

  isCampaignRun = true;
  activeCampaignLevel = level;
  campaignMode = level.objective;

  showScreen("arena-screen");

  requestAnimationFrame(() => {
    arenaElement.dataset.map = level.map || "flat";
    arenaElement.dataset.objective = level.objective;

    if (level.objective === "dialog") {
      dialogController.start(level.dialogs || []);
      return;
    }

    renderHand(playerProgress.deck);
    setupCampaignArena(level);
    configureCampaignMode(level);

    gameLoop.start();
  });
}

function setupCampaignArena(level) {
  arenaElement.dataset.map = level.map;
  arenaElement.dataset.objective = level.objective;

  campaignMode = level.objective;
  activeCampaignLevel = level;

  if (campaignMode === "surviveWaves") {
    campaignTimer = level.surviveDuration || 0;
  }

  setupArena(gameState, renderer, playerProgress, {
    noEnemyStructures: campaignMode === "surviveWaves" || campaignMode === "bossFight" || campaignMode === "dialog",
    enemyStructures: campaignMode === "destroyBase" ? level.enemyStructures : null
  });
}

function configureCampaignMode(level) {
  if (level.objective === "surviveWaves" || level.objective === "bossFight") {
    aiController.configure({
      decisionInterval: 999999,
      startingEnergy: 0,
      energyRegenRate: 0,
      energyRegenInterval: 999999,
      unitPool: []
    });

    campaignWaveController.start(level);
    return;
  }

  if (level.objective === "dialog") {
    aiController.configure({
      decisionInterval: 999999,
      startingEnergy: 0,
      energyRegenRate: 0,
      energyRegenInterval: 999999,
      unitPool: []
    });
    return;
  }

  aiController.configure(level.ai || {});
}

// check if player has won
function checkCampaignCompletion() {
  if (
    campaignMode !== "surviveWaves" &&
    campaignMode !== "bossFight"
  ) {
    return false;
  }

  if (!campaignWaveController.isFinished()) {
    return false;
  }

  if (!gameState.isGameOver) {
    gameState.isGameOver = true;
    gameState.winner = "player";
  }

  return true;
}
// === end CAMPAIGN ===

// top UI stuff
const arenaBackBtn = document.getElementById("arena-back-btn");
const arenaBackModal = document.getElementById("arena-back-modal");
const arenaContinueBtn = document.getElementById("arena-continue-btn");
const arenaMenuBtn = document.getElementById("arena-menu-btn");

arenaBackBtn.addEventListener("click", () => {
  arenaBackModal.classList.add("active");
});

arenaContinueBtn.addEventListener("click", () => {
  arenaBackModal.classList.remove("active");
});

arenaMenuBtn.addEventListener("click", () => {
  arenaBackModal.classList.remove("active");
  gameLoop.stop();
  showScreen("campaign-screen");
  campaignScreen.render();
});
// end top UI stuff

// back to menu after campaign dialog
backToMenuBtn.addEventListener("click", () => {
  arenaBackModal.classList.remove("active");
  gameLoop.stop();
  showScreen("campaign-screen");
  campaignScreen.render();
});

// spawn unit
function spawnUnit(definition, team, x, y, options = {}) {
  const unit = new Unit(definition, team, x, y);

  if (options.isBoss) {
    unit.isBoss = true;
  }

  gameState.addUnit(unit);

  if (definition.sounds?.spawn) {
    audioManager.play(definition.sounds.spawn);
  }

  AbilitySystem.onSpawn(unit, gameState, (u, radius) => {
    AnimationSystem.playSpawnFreeze(renderer.arenaElement, u, radius);
    if (options.onSpawnEffect) {
      options.onSpawnEffect(u, radius);
    }
  });

  return unit;
}

// ===== helpers pour génération d'un ennemi randomisé (combat hors-campagne)
function getUnlockedStructures(category) {
  return Object.entries(UnitDefinitions)
    .filter(([id, definition]) => {
      return (
        definition.category === category &&
        playerProgress.isUnlocked(id)
      );
    })
    .map(([id]) => id);
}

function pickRandom(items, fallback) {
  if (!items.length) return fallback;
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomEnemyStructures() {
  const unlockedBases = getUnlockedStructures("base");
  const unlockedTowers = getUnlockedStructures("tower");

  return {
    baseId: pickRandom(
      unlockedBases,
      "base_usine"
    ),
    leftTowerId: pickRandom(
      unlockedTowers,
      "tower_standard"
    ),
    rightTowerId: pickRandom(
      unlockedTowers,
      "tower_standard"
    )
  };
}

function getHighestUnlockedCampaignLevel() {
  const unlockedIds = playerProgress.unlockedCampaignLevels || [];

  if (!unlockedIds.length) {
    return 1;
  }

  return Math.max(...unlockedIds);
}

function getNormalBattleDifficulty() {
  const highestLevel = getHighestUnlockedCampaignLevel();

  if (highestLevel >= 5) {
    return {
      decisionInterval: 1.4,
      startingEnergy: 3,
      energyRegenRate: 1,
      energyRegenInterval: 1500,
      unitPool: [
        "chauffage",
        "motobineuse",
        "compacteur",
        "broyeur",
        "minipelle",
        "tombereau",
        "climatiseur",
        "brumisateur"
      ],
      aggression: 0.8,
      behavior: "pressure"
    };
  }

  if (highestLevel >= 3) {
    return {
      decisionInterval: 2.2,
      startingEnergy: 2,
      energyRegenRate: 1,
      energyRegenInterval: 1900,
      unitPool: [
        "chauffage",
        "motobineuse",
        "compacteur",
        "broyeur"
      ],
      aggression: 0.6,
      behavior: "balanced"
    };
  }

  if (highestLevel >= 2) {
    return {
      decisionInterval: 3,
      startingEnergy: 1,
      energyRegenRate: 1,
      energyRegenInterval: 2200,
      unitPool: [
        "chauffage",
        "motobineuse",
        "compacteur"
      ],
      aggression: 0.45,
      behavior: "balanced"
    };
  }

  return {
    decisionInterval: 4,
    startingEnergy: 0,
    energyRegenRate: 1,
    energyRegenInterval: 2500,
    unitPool: [
      "chauffage",
      "motobineuse"
    ],
    aggression: 0.3,
    behavior: "balanced"
  };
}

function configureNormalBattleAI() {
  aiController.configure(getNormalBattleDifficulty());
}
// =====