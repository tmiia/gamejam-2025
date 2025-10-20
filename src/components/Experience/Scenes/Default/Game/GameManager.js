import gsap from "gsap";
import * as THREE from "three";
import Experience from "../../../Experience.js";
import Particles from "../CompsGameplay/Particles.js";

export default class GameManager {
  constructor() {
    this.experience = new Experience();

    this.isLoadeDiv = document.getElementById("isLoaded");
    this.particles = null;
    this.cameraSettings = {
      yMultiplier: 0,
      xOffset: 2,
      yLookAt: 2,
      zOffset: 0,
    };

    this.startGame();
    // this.initParticles();
  }
  initParticles(position) {
    this.particles = new Particles(
      this.endGame,
      new THREE.Vector3(position.x, position.y, position.z)
    );
  }
  startGame() {
    gsap.to(this.isLoadeDiv, {
      opacity: 0,
      duration: 1,
      delay: 1,
      onComplete: () => {},
    });

    // console.log(
    //   this.experience.sceneManager.currentScene.GameManager.cameraSettings
    // );

    gsap.fromTo(
      this.cameraSettings,
      {
        zOffset: 0,
        yLookAt: 2,
      },
      // {
      //   zOffset: 7.5,
      //   xOffset: 1,
      //   yLookAt: 0,
      //   duration: 1,
      //   ease: "power3.inOut",
      //   // delay: 2,
      // }
      // Scene 3
      // {
      //   zOffset: 7.5,
      //   xOffset: 1,
      //   yLookAt: 0,
      //   duration: 1,
      //   ease: "power3.inOut",
      //   // delay: 2,
      // }
      // Scene 2
      // {
      //   zOffset: 25,
      //   xOffset: 1.5,
      //    yLookAt: -0.35,
      //   duration: 1,
      //   ease: "power3.inOut",
      //   // delay: 2,
      // }

      // Scene 1
      {
        zOffset: 25,
        xOffset: 5,
        yLookAt: 2.5,
        duration: 1,
        ease: "power3.inOut",
        // delay: 2,
      }
    );

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
    if (this.particles) this.particles.update();
  }
}
