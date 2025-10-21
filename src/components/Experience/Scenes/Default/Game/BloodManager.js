import Experience from "../../../Experience.js";

export default class BloodManager {
  constructor() {
    this.experience = new Experience();

    this.scene = this.experience.sceneManager.currentScene;
    this.maxDuration = 100;
    this.actualDuration = 0;
  }

  update() {
    // console.log(this.scene.gameManager.isEnded);

    // if (this.scene.gameManager.isEnded === true) {
    //   console.log("BloodManager: Game has ended, stopping blood loss update");
    // }
    if (
      this.actualDuration < this.maxDuration &&
      this.scene.gameManager.isStarted
    ) {
      //   console.log(
      //     "BloodManager: Increasing blood loss duration",
      //     this.actualDuration.toFixed(2)
      //   );

      this.actualDuration += this.experience.time.delta / 1000;
    } else if (this.scene.gameManager.isEnded === false) {
      console.log("BloodManager: Max blood loss duration reached, ending game");

      this.experience.sceneManager.currentScene.gameManager.endGame();
      //   alert("Game Over due to blood loss!");
    }
  }
}
