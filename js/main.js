import { GameState } from "./core/GameState.js";
import { Unit } from "./core/Unit.js";
import { Tower } from "./core/Tower.js";
import { GameLoop } from "./core/GameLoop.js";
import { Renderer } from "./render/Renderer.js";
import { DragDropController } from "./input/DragDropController.js";
import { UnitDefinitions, TowerDefinition } from "./config/unitDefinitions.js";

import { AIController } from "./core/AIController.js";
import { DifficultyLevels } from "./config/difficultyLevels.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

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

const deployableUnits = ["chauffage", "motobineuse"];

const currentDifficulty = DifficultyLevels[1];

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function buildHand() {
  handContainer.innerHTML = "";
  deployableUnits.forEach((defId) => {
    const def = UnitDefinitions[defId];
    const cardEl = document.createElement("button");
    cardEl.className = "card";
    cardEl.dataset.definitionId = defId;
    cardEl.innerHTML = `
      <img src="${def.sprite}" alt="${def.name}" />
      <span class="card-cost">${def.cost}</span>
    `;
    handContainer.appendChild(cardEl);
    dragDropController.bindCard(cardEl, defId);
  });
}

function setupArena(gameState, renderer) {
  const arenaRect = arenaElement.getBoundingClientRect();
  const centerX = arenaRect.width / 2;

  const enemyTower = new Tower(TowerDefinition, "enemy", centerX, arenaRect.height * 0.08);
  const playerTower = new Tower(TowerDefinition, "player", centerX, arenaRect.height * 0.92);

  gameState.addTower(enemyTower);
  gameState.addTower(playerTower);
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
    const defId = cardEl.dataset.definitionId;
    const cost = UnitDefinitions[defId].cost;
    cardEl.classList.toggle("disabled", !gameState.canAfford(cost));
  });
}

function handleGameOver(winner) {
  victoryTitle.textContent = winner === "player" ? "Victoire !" : "Défaite";
  victorySubtitle.textContent =
    winner === "player"
      ? "La base ennemie est détruite."
      : "Votre base a été détruite.";
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
  }
});

const gameLoop = new GameLoop({
  gameState,
  renderer,
  onEnergyChange: updateEnergyUI,
  onGameOver: handleGameOver,
  aiController
});

const dragDropController = new DragDropController({
  arenaElement,
  gameState,
  unitDefinitions: UnitDefinitions,
  onSpawn: (definition, x, y) => {
    const unit = new Unit(definition, "player", x, y);
    gameState.addUnit(unit);
    updateEnergyUI();
  }
});

dragDropController.bindArena();
buildHand();

playBtn.addEventListener("click", () => {
  showScreen("arena-screen");
  setupArena(gameState, renderer);
  updateEnergyUI();
  gameLoop.start();
});

backToMenuBtn.addEventListener("click", () => {
  window.location.reload();
});