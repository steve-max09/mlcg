export class DragDropController {
  constructor({ arenaElement, gameState, unitDefinitions, onSpawn }) {
    this.arenaElement = arenaElement;
    this.gameState = gameState;
    this.unitDefinitions = unitDefinitions;
    this.onSpawn = onSpawn;

    this.draggedDefinitionId = null;
    this.ghostElement = null;

    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
  }

  bindCard(cardElement, definitionId) {
    cardElement.style.touchAction = "none";

    cardElement.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      this.startDrag(definitionId, event);
    });
  }

  bindArena() {
    this.arenaElement.style.touchAction = "none";
  }

  startDrag(definitionId, event) {
    const definition = this.unitDefinitions[definitionId];
    if (!definition) return;
    if (!this.gameState.canAfford(definition.cost)) return;

    this.draggedDefinitionId = definitionId;
    this.createGhost(definition, event);

    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
  }

  createGhost(definition, event) {
    const ghost = document.createElement("img");
    ghost.src = definition.sprite;
    ghost.className = "drag-ghost";
    document.body.appendChild(ghost);
    this.ghostElement = ghost;
    this.moveGhost(event.clientX, event.clientY);
  }

  moveGhost(x, y) {
    if (!this.ghostElement) return;
    this.ghostElement.style.left = `${x}px`;
    this.ghostElement.style.top = `${y}px`;
  }

  handlePointerMove(event) {
    if (!this.draggedDefinitionId) return;
    this.moveGhost(event.clientX, event.clientY);
  }

  handlePointerUp(event) {
    if (!this.draggedDefinitionId) return;

    this.trySpawn(event);
    this.cleanupDrag();
  }

  trySpawn(event) {
    const definition = this.unitDefinitions[this.draggedDefinitionId];
    if (!definition) return;

    const rect = this.arenaElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const insideArena =
      x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

    if (!insideArena) return;
    if (y < rect.height * 0.5) return;
    if (!this.gameState.canAfford(definition.cost)) return;

    this.gameState.spendEnergy(definition.cost);
    this.onSpawn(definition, x, y);
  }

  cleanupDrag() {
    if (this.ghostElement) {
      this.ghostElement.remove();
      this.ghostElement = null;
    }
    this.draggedDefinitionId = null;
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
  }
}