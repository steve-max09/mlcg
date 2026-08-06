const STORAGE_KEY = "mlcg_player_progress";

const DEFAULT_UNLOCKED = ["chauffage", "motobineuse", "base_usine", "tower_standard"];
const DEFAULT_DECK = ["chauffage", "motobineuse"];

const DEFAULT_BASE_ID = "base_usine";
const DEFAULT_LEFT_TOWER_ID = "tower_standard";
const DEFAULT_RIGHT_TOWER_ID = "tower_standard";

export class PlayerProgress {
  constructor() {
    this.unlockedUnits = [...DEFAULT_UNLOCKED];
    this.deck = [...DEFAULT_DECK];

    this.playerBaseId = "base_usine";
    this.enemyBaseId = "base_usine";

    this.playerLeftTowerId = "tower_standard";
    this.playerRightTowerId = "tower_standard";
    this.enemyLeftTowerId = "tower_standard";
    this.enemyRightTowerId = "tower_standard";

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
      if (data.playerBaseId) this.playerBaseId = data.playerBaseId;
      if (data.playerLeftTowerId) this.playerLeftTowerId = data.playerLeftTowerId;
      if (data.playerRightTowerId) this.playerRightTowerId = data.playerRightTowerId;
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
        playerBaseId: this.playerBaseId,
        playerLeftTowerId: this.playerLeftTowerId,
        playerRightTowerId: this.playerRightTowerId,
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

  setPlayerBase(id) { this.playerBaseId = id; this.save(); }
  setEnemyBase(id) { this.enemyBaseId = id; this.save(); }

  setPlayerLeftTower(id) { this.playerLeftTowerId = id; this.save(); }
  setPlayerRightTower(id) { this.playerRightTowerId = id; this.save(); }
  setEnemyLeftTower(id) { this.enemyLeftTowerId = id; this.save(); }
  setEnemyRightTower(id) { this.enemyRightTowerId = id; this.save(); }

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