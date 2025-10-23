import Experience from "../../../Experience.js";

export default class ScoreManager {
  constructor() {
    this.experience = new Experience();
    this.maxDuration =
      this.experience.sceneManager.currentScene.bloodManager.maxDuration;

    this.maxScore = 300000;
    this.minScore = 30000;

    this.scoreNumberElement = document.getElementById("scoreNumber");
    this.scoreRatio = null;
    this.actualScore = null;
  }

  calculateScore() {
    this.actualScore =
      this.minScore + (this.maxScore - this.minScore) * this.scoreRatio;
    this.scoreNumberElement.innerText = Math.max(
      30000,
      Math.floor(this.actualScore)
    );
    return Math.floor(this.actualScore);
  }

  update() {
    this.scoreRatio =
      1 -
      this.experience.sceneManager.currentScene.bloodManager.actualDuration /
        this.maxDuration;

    this.calculateScore();
  }
}
