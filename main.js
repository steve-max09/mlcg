const mainMenu = document.getElementById("main-menu");
const arenaScreen = document.getElementById("arena-screen");
const playBtn = document.getElementById("playBtn");
const energyFill = document.getElementById("energyFill");
const energyValue = document.getElementById("energyValue");
const cards = [...document.querySelectorAll(".card")];

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => console.log("Service worker enregistré"))
      .catch((err) => console.error("Erreur SW:", err));
  });
}

let energy = 5;
const maxEnergy = 10;

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

function updateEnergyUI() {
  const ratio = (energy / maxEnergy) * 100;
  energyFill.style.width = `${ratio}%`;
  energyValue.textContent = `${energy}/${maxEnergy}`;
}

function startEnergyRegen() {
  setInterval(() => {
    if (energy < maxEnergy) {
      energy += 1;
      updateEnergyUI();
    }
  }, 1800);
}

playBtn.addEventListener("click", () => {
  showScreen("arena-screen");
});

cards.forEach((card, index) => {
  card.addEventListener("click", () => {
    cards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");

    if (energy > 0) {
      energy -= 1;
      updateEnergyUI();
    }
  });
});

updateEnergyUI();
startEnergyRegen();