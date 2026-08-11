export class DialogController {
  constructor({ overlay, sprite, character, text, continueButton, onComplete }) {
    this.overlay = overlay;
    this.sprite = sprite;
    this.character = character;
    this.text = text;
    this.continueButton = continueButton;
    this.onComplete = onComplete;
    this.dialogs = [];
    this.index = 0;
    this.isActive = false;

    this.handleNext = this.handleNext.bind(this);

    this.overlay.addEventListener("pointerup", this.handleNext);
    this.continueButton.addEventListener("pointerup", (event) => {
      event.stopPropagation();
      this.handleNext();
    });
  }

  start(dialogs = []) {
    this.dialogs = dialogs;
    this.index = 0;
    this.isActive = true;
    this.overlay.classList.add("active");
    this.renderCurrent();
  }

  handleNext() {
    if (!this.isActive) return;

    this.index += 1;

    if (this.index >= this.dialogs.length) {
      this.close();
      if (this.onComplete) this.onComplete();
      return;
    }

    this.renderCurrent();
  }

  renderCurrent() {
    const dialog = this.dialogs[this.index];
    if (!dialog) return;

    this.character.textContent = dialog.character || "";
    this.text.textContent = dialog.text || "";

    if (dialog.sprite) {
      this.sprite.src = dialog.sprite;
      this.sprite.alt = dialog.character || "";
      this.sprite.classList.remove("hidden");
    } else {
      this.sprite.removeAttribute("src");
      this.sprite.alt = "";
      this.sprite.classList.add("hidden");
    }
  }

  close() {
    this.isActive = false;
    this.overlay.classList.remove("active");
  }
}