const STORAGE_KEY = "mlcg_player_progress";

const DEFAULT_UNLOCKED = ["chauffage", "motobineuse"];
const DEFAULT_DECK = ["chauffage", "motobineuse"];

const DEFAULT_BASE_ID = "base_usine";
const DEFAULT_LEFT_TOWER_ID = "tower_standard";
const DEFAULT_RIGHT_TOWER_ID = "tower_standard";

export class PlayerProgress {
  constructor() {
    this.unlockedUnits = [...DEFAULT_UNLOCKED];
    this.deck = [...DEFAULT_DECK];

    this.selectedBaseId = DEFAULT_BASE_ID;
    this.selectedLeftTowerId = DEFAULT_LEFT_TOWER_ID;
    this.selectedRightTowerId = DEFAULT_RIGHT_TOWER_ID;

    this.yanga = 11000;
    this.ownedChests = [];
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
      if (Array.isArray(data.ownedChests)) this.ownedChests = data.ownedChests;
      if (data.selectedBaseId) this.selectedBaseId = data.selectedBaseId;
      if (data.selectedLeftTowerId) this.selectedLeftTowerId = data.selectedLeftTowerId;
      if (data.selectedRightTowerId) this.selectedRightTowerId = data.selectedRightTowerId;
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
        selectedBaseId: this.selectedBaseId,
        selectedLeftTowerId: this.selectedLeftTowerId,
        selectedRightTowerId: this.selectedRightTowerId,
        yanga: this.yanga,
        ownedChests: this.ownedChests
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
    return this.deck.length >= 1;
  }

  setBase(unitId) {
    this.selectedBaseId = unitId;
    this.save();
  }

  setLeftTower(unitId) {
    this.selectedLeftTowerId = unitId;
    this.save();
  }

  setRightTower(unitId) {
    this.selectedRightTowerId = unitId;
    this.save();
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

  buyChest(chestId, price) {
    if (!this.spendYanga(price)) return false;
    this.ownedChests.push({ chestId, instanceId: `${chestId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` });
    this.save();
    return true;
  }

  removeChest(instanceId) {
    this.ownedChests = this.ownedChests.filter((c) => c.instanceId !== instanceId);
    this.save();
  }
}