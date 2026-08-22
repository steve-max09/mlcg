import { GeometryUtils } from "../core/GeometryUtils.js";

export class DragDropController {
  constructor({ arenaElement, gameState, unitDefinitions, onSpawn }) {
    this.arenaElement = arenaElement;
    this.gameState = gameState;
    this.unitDefinitions = unitDefinitions;
    this.onSpawn = onSpawn;

    this.draggedDefinitionId = null;
    this.ghostElement = null;
    this.activePointerId = null;

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

  startDrag(definitionId, event) {
    const definition = this.unitDefinitions[definitionId];
    if (!definition) return;
    if (!this.gameState.canAfford(definition.cost)) return;

    this.draggedDefinitionId = definitionId;
    this.activePointerId = event.pointerId;
    this.createGhost(definition, event);

    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
    window.addEventListener("pointercancel", this.handlePointerUp);
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
    if (event.pointerId !== this.activePointerId) return;
    this.moveGhost(event.clientX, event.clientY);
  }

  handlePointerUp(event) {
    if (!this.draggedDefinitionId) return;
    if (event.pointerId !== this.activePointerId) return;

    this.trySpawn(event);
    this.cleanupDrag();
  }

  trySpawn(event) {
    const definition = this.unitDefinitions[this.draggedDefinitionId];
    if (!definition) return;
    if (!this.gameState.canAfford(definition.cost)) return;

    const rect = this.arenaElement.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    const isOutsideArena =
      x < -40 || x > rect.width + 40 || y < -40 || y > rect.height + 40;

    if (isOutsideArena) return;

    const minY = rect.height * 0.5 + 10;
    const maxY = rect.height - 20;
    const minX = 20;
    const maxX = rect.width - 20;

    x = Math.min(Math.max(x, minX), maxX);
    y = Math.min(Math.max(y, minY), maxY);

    const obstacles = this.gameState.mapGeometry?.movement || [];
    const collisionRadius = definition.hitboxRadius || 20;

    const validPosition = GeometryUtils.findNearestValidPosition(x, y, collisionRadius, obstacles, {
      width: rect.width,
      height: rect.height
    });

    if (!validPosition) return;

    x = validPosition.x;
    y = validPosition.y;

    this.gameState.spendEnergy(definition.cost);
    this.onSpawn(definition, x, y);
  }

  cleanupDrag() {
    if (this.ghostElement) {
      this.ghostElement.remove();
      this.ghostElement = null;
    }
    this.draggedDefinitionId = null;
    this.activePointerId = null;
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("pointercancel", this.handlePointerUp);
  }
}