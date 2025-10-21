import Experience from "../../../Experience.js";

export default class BloodManager {
  constructor() {
    this.experience = new Experience();

    this.scene = this.experience.sceneManager.currentScene;
    this.maxDuration = 10;
    this.actualDuration = 0;
  }

  update() {
    if (
      this.actualDuration < this.maxDuration &&
      this.scene.gameManager.isStarted
    ) {
      console.log(
        "BloodManager: Increasing blood loss duration",
        this.actualDuration.toFixed(2)
      );

      this.actualDuration += this.experience.time.delta / 1000;
    } else if (this.scene.gameManager.isEnded === false) {
      this.experience.sceneManager.currentScene.gameManager.endGame();
      //   alert("Game Over due to blood loss!");
    }
  }
}
