import gsap from "gsap";
import * as THREE from "three";
import Experience from "../../../Experience.js";
import Particles from "../CompsGameplay/Particles.js";

export default class GameManager {
  constructor() {
    this.experience = new Experience();

    this.isLoadeDiv = document.getElementById("isLoaded");

    this.isStarted = false;
    this.isEnded = false;

    this.particles = null;
    this.cameraSettings = {
      yMultiplier: 0,
      xOffset: 0,
      yLookAt: 0,
      zOffset: 0,
      lerpSpeed: 0.5,
    };

    this.cameraScenesValues = {
      scene1: { zOffset: 25, xOffset: 5, yLookAt: 2.5, lerpSpeed: 0.025 },
      scene2: { zOffset: 25, xOffset: 1.5, yLookAt: -0.35, lerpSpeed: 0.025 },
      scene3: { zOffset: 7.5, xOffset: 0, yLookAt: 0, lerpSpeed: 0.025 },
      // scene3: { zOffset: 7.5, xOffset: 1, yLookAt: 0, lerpSpeed: 0.025 },
    };

    this.startGame();
    this.level2();
    this.level3();
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
      ease: "power3.inOut",
    });

    gsap.to(this.cameraSettings, {
      zOffset: this.cameraScenesValues.scene1.zOffset,
      xOffset: this.cameraScenesValues.scene1.xOffset,
      yLookAt: this.cameraScenesValues.scene1.yLookAt,
      duration: 5,
      ease: "power3.inOut",
      delay: 1,
      onComplete: () => {
        this.cameraSettings.lerpSpeed =
          this.cameraScenesValues.scene1.lerpSpeed;
        this.isStarted = true;
        this.isEnded = false;
      },
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

  mooveCamera(zOffset, xOffset, yLookAt, lerp, duration = 1) {
    gsap.to(this.cameraSettings, {
      zOffset: zOffset,
      xOffset: xOffset,
      yLookAt: yLookAt,
      lerpSpeed: lerp,
      duration: duration,
      ease: "power3.inOut",
    });
  }
  level2() {
    this.levelTwo = new Particles(
      () =>
        this.mooveCamera(
          this.cameraScenesValues.scene2.zOffset,
          this.cameraScenesValues.scene2.xOffset,
          this.cameraScenesValues.scene2.yLookAt,
          this.cameraScenesValues.scene2.lerpSpeed,
          4.5
        ),
      new THREE.Vector3(-3, 0, 0)
    );
  }

  level3() {
    this.levelThree = new Particles(
      () =>
        this.mooveCamera(
          this.cameraScenesValues.scene3.zOffset,
          this.cameraScenesValues.scene3.xOffset,
          this.cameraScenesValues.scene3.yLookAt,
          this.cameraScenesValues.scene3.lerpSpeed,
          4.5
        ),
      new THREE.Vector3(-8, 0, 0)
    );
  }

  endGame() {
    this.isLoadeDiv = document.getElementById("isLoaded");
    this.isEnded = true;
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
    if (this.levelTwo) this.levelTwo.update();
    if (this.levelThree) this.levelThree.update();
  }
}
