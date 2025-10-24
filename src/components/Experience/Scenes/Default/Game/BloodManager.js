import Experience from "../../../Experience.js";

export default class BloodManager {
  constructor() {
    this.experience = new Experience();

    this.scene = this.experience.sceneManager.currentScene;
    this.maxDuration = 180;
    this.actualDuration = 0;
    this.bloodMultiplier = 1;
    this.bloodLevel = document.getElementById("bloodLevelSpan");

    this.postProcessing = this.experience.postProcessing;
    this.isCriticalState = false;
  }

  update() {
    if (
      this.experience.sceneManager.currentScene.character.characterController
        ._isRunning &&
      this.experience.sceneManager.currentScene.character.characterController
        ._isMoving
    ) {
      this.bloodMultiplier = 3;
    } else if (this.experience.sceneManager.currentScene.character.characterController._isJumping) {
      this.bloodMultiplier = 12;
    } else {
      this.bloodMultiplier = 1;
    }
    
    if (
      this.actualDuration < this.maxDuration &&
      this.scene.gameManager.isStarted
    ) {
      this.actualDuration +=
        (this.experience.time.delta / 1000) * this.bloodMultiplier;

      const bloodPercentage =
        100 - (this.actualDuration / this.maxDuration) * 100;
      this.bloodLevel.style.width = bloodPercentage + "%";
      this.scene.bloodParticles.creationInterval = Math.max(
        100,
        750 - (this.actualDuration / this.maxDuration) * 1000
      );

      let muffleFrequency = 20000 - ((100 - bloodPercentage) / 100) * 19900;

      if (bloodPercentage <= 45 && !this.isCriticalState) {
        this.isCriticalState = true;
        if (this.postProcessing) {          
          this.postProcessing.playGlitchEffect();
        }
        if (this.experience.audioManager) {
          this.experience.audioManager.startTickingSound();
        }
      }

      if (this.isCriticalState) {
        const criticalFrequency = 100 + (bloodPercentage / 45) * 400;
        muffleFrequency = Math.min(criticalFrequency, muffleFrequency);
      }

      if (this.experience.audioManager) {
        this.experience.audioManager.setMuffleFrequency(muffleFrequency);
      }
    } else if (this.scene.gameManager.isEnded === false) {
      this.experience.sceneManager.currentScene.gameManager.endGame();
    }
  }
}
