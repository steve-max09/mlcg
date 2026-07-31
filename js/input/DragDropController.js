export class DragDropController {
  constructor({ arenaElement, gameState, unitDefinitions, onSpawn }) {
    this.arenaElement = arenaElement;
    this.gameState = gameState;
    this.unitDefinitions = unitDefinitions;
    this.onSpawn = onSpawn;
    this.draggedDefinitionId = null;
  }

  bindCard(cardElement, definitionId) {
    cardElement.addEventListener("pointerdown", (event) => {
      this.draggedDefinitionId = definitionId;
      event.preventDefault();
    });
  }

  bindArena() {
    this.arenaElement.addEventListener("pointerup", (event) => {
      if (!this.draggedDefinitionId) return;
      this.trySpawn(event);
      this.draggedDefinitionId = null;
    });
  }

  trySpawn(event) {
    const definition = this.unitDefinitions[this.draggedDefinitionId];
    if (!definition) return;
    if (!this.gameState.canAfford(definition.cost)) return;

    const rect = this.arenaElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (y < rect.height * 0.5) return; // interdit de poser côté ennemi

    this.gameState.spendEnergy(definition.cost);
    this.onSpawn(definition, x, y);
  }
}