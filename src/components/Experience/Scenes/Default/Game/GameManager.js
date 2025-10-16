import gsap from "gsap";
import Experience from "../../../Experience.js";
import Particles from "../CompsGameplay/Particles.js";

export default class GameManager {
  constructor() {
    this.experience = new Experience();

    this.isLoadeDiv = document.getElementById("isLoaded");
    this.startGame();
    this.particles = new Particles(this.endGame);
  }
  startGame() {
    gsap.to(this.isLoadeDiv, {
      opacity: 0,
      duration: 1,
      delay: 1,
    });

    try {
      fetch("TestZebi", {
        method: "POST",
        body: JSON.stringify({
          game: "Zebi",
          status: "started",
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }
  endGame() {
    this.isLoadeDiv = document.getElementById("isLoaded");
    gsap.to(this.isLoadeDiv, {
      opacity: 1,
      duration: 1,
    });
    try {
      fetch("TestZebi", {
        method: "POST",
        body: JSON.stringify({
          game: "Zebi",
          status: "ended",
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  update() {
    this.particles.update();
  }
}
