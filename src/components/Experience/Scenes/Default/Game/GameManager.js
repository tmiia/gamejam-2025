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

    this.ghost = this.experience.sceneManager.currentScene.ghost.ghost;

    this.stockPosition = new THREE.Vector3(0, 0, 0);
    this.character = null;

    this.particles = null;
    this.cameraSettings = {
      yMultiplier: 0,
      xOffset: 0,
      yLookAt: 0,
      zOffset: 0,
      lerpSpeed: 0.5,
    };

    this.cameraScenesValues = {
      start: { zOffset: 10, xOffset: 0, yLookAt: 1, lerpSpeed: 0.025 },
      scene1: { zOffset: 25, xOffset: 5, yLookAt: 2.5, lerpSpeed: 0.025 },
      scene2: { zOffset: 25, xOffset: 1.5, yLookAt: -0.35, lerpSpeed: 0.025 },
      scene3: { zOffset: 7.5, xOffset: 0, yLookAt: 0, lerpSpeed: 0.025 },
    };

    this.gameOver = document.getElementById("gameOver");

    this.storedPositions = {
      end: null,
      cam1: null,
      cam2: null,
      ghost: null,
    };

    this.levelTwo = null;
    this.levelThree = null;
    this.crazyzy = null;

    // this.startGame();
    // this.level2();
    // this.level3();
    // this.initParticles();
  }

  initParticles(position) {
    if (!this.storedPositions.end) {
      this.storedPositions.end = position.clone();
    }

    this.particles = new Particles(
      () => this.endGame(),
      new THREE.Vector3(-position.x, -position.y, -position.z),
      true,
      () => {
        this.particles = null;
      }
    );
  }

  resetAllTimers() {
    const scene = this.experience.sceneManager.currentScene;
    if (scene.bloodParticles) {
      scene.bloodParticles.timeSinceLastCreation = 0;
    }
    if (scene.bloodManager) {
      scene.bloodManager.actualDuration = 0;
    }
  }

  startGame(position, character) {
    this.position = position;
    if (position) {
      this.stockPosition = position.clone();
    } else {
      this.position = this.stockPosition;
    }

    if (character) {
      this.character = character;
    } else {
      character = this.character;
    }

    gsap.to(this.isLoadeDiv, {
      opacity: 0,
      duration: 1,
      delay: 2,
      ease: "power3.inOut",
    });

    character.rigidbody.setTranslation(
      {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z,
      },
      true
    );

    gsap.to(this.cameraSettings, {
      zOffset: this.cameraScenesValues.start.zOffset,
      xOffset: this.cameraScenesValues.start.xOffset,
      yLookAt: this.cameraScenesValues.start.yLookAt,
      duration: 5,
      ease: "power3.inOut",
      delay: 1,
      onComplete: () => {
        this.cameraSettings.lerpSpeed = this.cameraScenesValues.start.lerpSpeed;
        this.isStarted = true;
        this.isEnded = false;
        this.resetAllTimers();

        if (!this.particles && this.storedPositions.end) {
          this.initParticles(this.storedPositions.end);
        }
        if (!this.levelTwo && this.storedPositions.cam1) {
          this.level1(this.storedPositions.cam1);
        }
        if (!this.levelThree && this.storedPositions.cam2) {
          this.level2(this.storedPositions.cam2);
        }
        if (!this.crazyzy && this.storedPositions.ghost) {
          this.animateCrazyGhotst(this.storedPositions.ghost);
        }
      },
    });
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

  level1(position) {
    if (!this.storedPositions.cam1) {
      this.storedPositions.cam1 = position.clone();
    }

    this.levelTwo = new Particles(
      () =>
        this.mooveCamera(
          this.cameraScenesValues.scene1.zOffset,
          this.cameraScenesValues.scene1.xOffset,
          this.cameraScenesValues.scene1.yLookAt,
          this.cameraScenesValues.scene1.lerpSpeed,
          4.5
        ),
      new THREE.Vector3(position.x, position.y, position.z),
      true,
      () => {
        this.levelTwo = null;
      }
    );
  }

  level2(position) {
    if (!this.storedPositions.cam2) {
      this.storedPositions.cam2 = position.clone();
    }

    this.levelThree = new Particles(
      () =>
        this.mooveCamera(
          this.cameraScenesValues.scene2.zOffset,
          this.cameraScenesValues.scene2.xOffset,
          this.cameraScenesValues.scene2.yLookAt,
          this.cameraScenesValues.scene2.lerpSpeed,
          4.5
        ),
      new THREE.Vector3(position.x, position.y, position.z),
      true,
      () => {
        this.levelThree = null;
      } //
    );
  }

  animateCrazyGhotst(position) {
    if (!this.storedPositions.ghost) {
      this.storedPositions.ghost = position.clone();
    }

    this.crazyzy = new Particles(
      () => this.crazyGhost(),
      new THREE.Vector3(position.x, position.y, position.z),
      true,
      () => {
        this.crazyzy = null;
      }
    );
  }

  crazyGhost() {
    this.ghost.visible = true;
    gsap.to(this.ghost.position, {
      x: 50,
      duration: 10,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.to(this.ghost.material, {
          opacity: 0,
          duration: 2,
          onComplete: () => {
            this.ghost.visible = false;
            this.ghost.material.opacity = 1;
          },
        });
      },
    });
    console.log(this.ghost);
  }

  endGame() {
    if (this.isEnded) return;
    if (!this.isStarted) return;
    this.isEnded = true;
    this.isStarted = false;

    const gradientObj = { percent: 0 };

    gsap.to(this.gameOver, {
      opacity: 1,
      duration: 0.4,
      ease: "power3.inOut",
    });

    gsap.to(gradientObj, {
      percent: 100,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => {
        this.gameOver.style.background = `radial-gradient(circle, rgba(0,0,0,${
          gradientObj.percent / 100
        }) 0%, rgba(0,0,0,${gradientObj.percent / 90}) 100%)`;
      },

      onComplete: () => {
        gsap.to(this.gameOver, {
          opacity: 0,
          duration: 5,
          ease: "power3.inOut",
        });
        this.startGame(null, null);
      },
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
    if (this.crazyzy) this.crazyzy.update();
  }
}
