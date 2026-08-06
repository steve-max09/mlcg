import { GameState } from "./core/GameState.js";
import { Unit } from "./core/Unit.js";
import { Tower } from "./core/Tower.js";
import { GameLoop } from "./core/GameLoop.js";
import { Renderer } from "./render/Renderer.js";
import { DragDropController } from "./input/DragDropController.js";
import { UnitDefinitions } from "./config/unitDefinitions.js";

import { AIController } from "./core/AIController.js";
import { DifficultyLevels } from "./config/difficultyLevels.js";

import { AudioManager } from "./core/AudioManager.js";
import { UiSounds } from "./config/uiSounds.js";

import { AnimationSystem } from "./core/AnimationSystem.js";
import { AbilitySystem } from "./core/AbilitySystem.js";

import { PlayerProgress } from "./core/PlayerProgress.js";
import { DeckScreen } from "./core/DeckScreen.js";

import { ChestShop } from "./core/ChestShop.js";
import { ChestOpener } from "./core/ChestOpener.js";
import { ChestDefinitions } from "./config/chestDefinitions.js";

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
    showScreen("arena-screen");
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

const currentDifficulty = DifficultyLevels[1];

const audioManager = new AudioManager();
audioManager.uiSounds = UiSounds;

Object.values(UiSounds).forEach((src) => audioManager.preload(src));
Object.values(UnitDefinitions).forEach((def) => {
  if (def.sounds) Object.values(def.sounds).forEach((src) => audioManager.preload(src));
});

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function setupArena(gameState, renderer, playerProgress) {
  const arenaRect = arenaElement.getBoundingClientRect();
  const centerX = arenaRect.width / 2;

  // Bases
  const enemyBaseDef = UnitDefinitions[playerProgress.enemyBaseId] || UnitDefinitions.base_usine;
  const playerBaseDef = UnitDefinitions[playerProgress.playerBaseId] || UnitDefinitions.base_usine;

  const enemyBase = new Tower(enemyBaseDef, "enemy", centerX, arenaRect.height * 0.14);
  const playerBase = new Tower(playerBaseDef, "player", centerX, arenaRect.height * 0.92);

  gameState.addTower(enemyBase);
  gameState.addTower(playerBase);

  // Tours
  const enemyLeftDef = UnitDefinitions[playerProgress.enemyLeftTowerId] || UnitDefinitions.tower_standard;
  const enemyRightDef = UnitDefinitions[playerProgress.enemyRightTowerId] || UnitDefinitions.tower_standard;
  const playerLeftDef = UnitDefinitions[playerProgress.playerLeftTowerId] || UnitDefinitions.tower_standard;
  const playerRightDef = UnitDefinitions[playerProgress.playerRightTowerId] || UnitDefinitions.tower_standard;

  const offsetX = arenaRect.width * 0.22; // distance latérale depuis le centre
  const enemyY = arenaRect.height * 0.30;
  const playerY = arenaRect.height * 0.76;

  const enemyLeftTower = new Tower(enemyLeftDef, "enemy", centerX - offsetX, enemyY);
  const enemyRightTower = new Tower(enemyRightDef, "enemy", centerX + offsetX, enemyY);

  const playerLeftTower = new Tower(playerLeftDef, "player", centerX - offsetX, playerY);
  const playerRightTower = new Tower(playerRightDef, "player", centerX + offsetX, playerY);

  gameState.addTower(enemyLeftTower);
  gameState.addTower(enemyRightTower);
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
  victoryTitle.textContent = winner === "player" ? "Victoire !" : "Défaite";
  victorySubtitle.textContent =
    winner === "player"
      ? "La base ennemie est détruite."
      : "Votre base a été détruite.";

  if (winner === "player") {
    playerProgress.addYanga(50);
  }

  audioManager.play(winner === "player" ? UiSounds.victory : UiSounds.defeat);
  showScreen("victory-screen");
}

const gameState = new GameState();
const renderer = new Renderer(arenaElement);

const aiController = new AIController({
  gameState,
  unitDefinitions: UnitDefinitions,
  difficultyConfig: currentDifficulty,
  onSpawn: (definition, x, y) => {
    const unit = new Unit(definition, "enemy", x, y);
    gameState.addUnit(unit);
    updateEnergyUI();
    if (definition.sounds?.spawn) audioManager.play(definition.sounds.spawn);

    AbilitySystem.onSpawn(unit, gameState, (u, radius) => {
      AnimationSystem.playSpawnFreeze(renderer.arenaElement, u, radius);
    });
  }
});

const gameLoop = new GameLoop({
  gameState,
  renderer,
  onEnergyChange: updateEnergyUI,
  onGameOver: handleGameOver,
  aiController,
  audioManager
});

const dragDropController = new DragDropController({
  arenaElement,
  gameState,
  unitDefinitions: UnitDefinitions,
  onSpawn: (definition, x, y) => {
    const unit = new Unit(definition, "player", x, y);
    gameState.addUnit(unit);
    updateEnergyUI();
    if (definition.sounds?.spawn) audioManager.play(definition.sounds.spawn);

    AbilitySystem.onSpawn(unit, gameState, (u, radius) => {
      AnimationSystem.playSpawnFreeze(renderer.arenaElement, u, radius);
    });
  }
});

playBtn.addEventListener("click", () => {
  showScreen("arena-screen");
  startBattleWithDeck(playerProgress.deck);
});

backToMenuBtn.addEventListener("click", () => {
  window.location.reload();
});

// sons des boutons =======
function bindButtonSound(button) {
  button.addEventListener("click", () => {
    audioManager.play(UiSounds.buttonClick);
  });
}

[playBtn, backToMenuBtn].forEach(bindButtonSound);
// ========================

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

function startBattleWithDeck(deck) {
  renderHand(deck);

  gameState.reset();
  setupArena(gameState, renderer, playerProgress);

  gameLoop.stop();
  gameLoop.start();
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
      audioManager.play(UiSounds.buttonClick);
      chestOpener.openChest(chest.instanceId, chest.chestId);
    });

    row.appendChild(el);
  });
}
// === end CHESTS ===
