const STORAGE_KEY = "mlcg_player_progress";

const DEFAULT_UNLOCKED = ["chauffage", "motobineuse", "compacteur", "broyeur", "minipelle", "tombereau", "climatiseur", "brumisateur"];
const DEFAULT_DECK = ["chauffage", "motobineuse", "compacteur", "broyeur", "minipelle", "tombereau", "climatiseur", "brumisateur"];

export class PlayerProgress {
  constructor() {
    this.unlockedUnits = [...DEFAULT_UNLOCKED];
    this.deck = [...DEFAULT_DECK];
    this.yanga = 0;
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.unlockedUnits)) this.unlockedUnits = data.unlockedUnits;
      if (Array.isArray(data.deck)) this.deck = data.deck;
      if (typeof data.yanga === "number") this.yanga = data.yanga;
    } catch (error) {
      console.error("Erreur de chargement de la progression:", error);
    }
  }

  save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        unlockedUnits: this.unlockedUnits,
        deck: this.deck,
        yanga: this.yanga
      })
    );
  }

  isUnlocked(unitId) {
    return this.unlockedUnits.includes(unitId);
  }

  unlockUnit(unitId) {
    if (!this.unlockedUnits.includes(unitId)) {
      this.unlockedUnits.push(unitId);
      this.save();
    }
  }

  isInDeck(unitId) {
    return this.deck.includes(unitId);
  }

  addToDeck(unitId) {
    if (this.deck.length >= 8) return false;
    if (this.deck.includes(unitId)) return false;
    if (!this.isUnlocked(unitId)) return false;

    this.deck.push(unitId);
    this.save();
    return true;
  }

  removeFromDeck(unitId) {
    this.deck = this.deck.filter((id) => id !== unitId);
    this.save();
  }

  isDeckComplete() {
    return this.deck.length === 8;
  }

  addYanga(amount) {
    this.yanga += amount;
    this.save();
  }

  spendYanga(amount) {
    if (this.yanga < amount) return false;
    this.yanga -= amount;
    this.save();
    return true;
  }
}