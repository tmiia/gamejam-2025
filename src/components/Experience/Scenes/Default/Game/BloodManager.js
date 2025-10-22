import Experience from "../../../Experience.js";

export default class BloodManager {
  constructor() {
    this.experience = new Experience();

    this.scene = this.experience.sceneManager.currentScene;
    this.maxDuration = 200;
    this.actualDuration = 0;
    this.bloodMultiplier = 1;
    this.bloodLevel = document.getElementById("bloodLevelSpan");
    // this.postProcessing = this.experience.postProcessing;
    // console.log("this.bloodLevel", this.postProcessing);
  }

  update() {
    if (
      this.experience.sceneManager.currentScene.character.characterController
        ._isRunning &&
      this.experience.sceneManager.currentScene.character.characterController
        ._isMoving
    ) {
      this.bloodMultiplier = 3;
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
    } else if (this.scene.gameManager.isEnded === false) {
      console.log("BloodManager: Max blood loss duration reached, ending game");

      this.experience.sceneManager.currentScene.gameManager.endGame();
    }
  }
}
