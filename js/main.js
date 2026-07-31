import { GameState } from "./core/GameState.js";
import { Unit } from "./core/Unit.js";
import { GameLoop } from "./core/GameLoop.js";
import { Renderer } from "./render/Renderer.js";
import { DragDropController } from "./input/DragDropController.js";
import { UnitDefinitions } from "./config/unitDefinitions.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

const mainMenu = document.getElementById("main-menu");
const arenaScreen = document.getElementById("arena-screen");
const arenaElement = document.getElementById("arena");
const playBtn = document.getElementById("playBtn");
const energyValue = document.getElementById("energyValue");
const energyFill = document.getElementById("energyFill");
const cards = [...document.querySelectorAll(".card")];

const gameState = new GameState();
const renderer = new Renderer(arenaElement);

function updateEnergyUI() {
  const ratio = (gameState.energy / gameState.maxEnergy) * 100;
  energyFill.style.width = `${ratio}%`;
  energyValue.textContent = `${gameState.energy}/${gameState.maxEnergy}`;
}

const gameLoop = new GameLoop({
  gameState,
  renderer,
  onEnergyChange: updateEnergyUI
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

const cardDefinitionMap = ["chauffage", "nacelle", "chauffage", "nacelle"];
cards.forEach((cardEl, index) => {
  dragDropController.bindCard(cardEl, cardDefinitionMap[index]);
});

playBtn.addEventListener("click", () => {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  arenaScreen.classList.add("active");
  updateEnergyUI();
  gameLoop.start();
});