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
      rotation: 0,
    };

    this.cameraScenesValues = {
      start: { zOffset: 10, xOffset: 0, yLookAt: 1, lerpSpeed: 0.025, rotation: 0 },
      scene1: { zOffset: 25, xOffset: 5, yLookAt: 2.5, lerpSpeed: 0.025, rotation: 0 },
      scene2: { zOffset: 25, xOffset: 1.5, yLookAt: -0.35, lerpSpeed: 0.025, rotation: 0 },
      scene3: { zOffset: 7.5, xOffset: 0, yLookAt: 0, lerpSpeed: 0.025, rotation: 0 },
    };

    this.gameOver = document.getElementById("gameOver");
    this.videoGameOver = document.getElementById("endVideo");

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
      () => this.ENNNNNNNNNND(),
      new THREE.Vector3(position.x, position.y, position.z),
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
      scene.bloodManager.isCriticalState = false;
    }
    if (this.experience.postProcessing) {
      this.experience.postProcessing.stopGlitchEffect();
    }
    if (this.experience.audioManager) {
      this.experience.audioManager.stopTickingSound();
      this.experience.audioManager.setMuffleFrequency(20000);
    }
  }

  ENNNNNNNNNND() {
    this.isEnded = true;
    // const fog = this.gameOver.querySelector("#fogGameOver");
    // gsap.to(fog, {
    //   opacity: 0,
    //   duration: 0,
    // });

    gsap.to(this.videoGameOver, {
      opacity: 1,
      duration: 0.3,
      ease: "power3.inOut",
      onComplete: () => {
        this.videoGameOver.play();
      },
    });
    this.videoGameOver.onended = () => {
      function exitGame() {
        window.parent.postMessage(
          { type: "elevator-command", action: "backToElevator" },
          "*"
        );
      }

      exitGame();
    };
  }

  jumpScareFunction() {
    const jumpscareDiv = document.getElementById("jumpScare");
    const audio = document.getElementById("audio");

    gsap.fromTo(
      jumpscareDiv,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.1,
        ease: "power3.inOut",
        onStart: () => {
          audio.play();
          audio.volume = 1;
          audio.currentTime = 2;
          audio.onended = () => {
            gsap.to(jumpscareDiv, {
              opacity: 0,
              duration: 0.5,
              ease: "power3.inOut",
              delay: 0.5,
            });
          };
          console.log(audio);
        },
        // onComplete: () => {
        //   gsap.to(jumpscareDiv, {
        //     opacity: 0,
        //     duration: 0.5,
        //     ease: "power3.inOut",
        //     delay: 0.5,
        //     onComplete: () => {
        //       jumpscareVideo.src = "";
        //     },
        //   });
        // },
      }
    );
  }

  jumpScare(position) {
    this.jump = new Particles(
      () => this.jumpScareFunction(),
      new THREE.Vector3(position.x, position.y, position.z),
      true,
      () => {
        this.jump = null;
      } //
    );
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

    this.tutorial = document.getElementById("tutorial");
    this.instructions = document.getElementById("instructions");

    gsap.fromTo(
      this.instructions,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 1,
        ease: "power3.inOut",
        delay: 7.5,
      }
    );

    const instructionSpan = this.instructions.querySelector("span");

    instructionSpan.style.transformOrigin = "right";
    gsap.to(instructionSpan, {
      scaleX: 0,
      duration: 3.2,
      ease: "power3.inOut",
      delay: 7.5,
      onComplete: () => {
        instructionSpan.style.transformOrigin = "left";
        gsap.to(this.instructions, {
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          delay: 5,
        });
        gsap.to(instructionSpan, {
          scaleX: 0,
          duration: 2,
          ease: "power3.out",
          delay: 3,
        });
      },
    });

    gsap.to(this.tutorial, {
      opacity: 1,
      duration: 1,
      ease: "power3.inOut",
    });

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
      rotation: this.cameraScenesValues.start.rotation,
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

  mooveCamera(zOffset, xOffset, yLookAt, lerp, duration = 1, rotation = 0) {
    gsap.to(this.cameraSettings, {
      zOffset: zOffset,
      xOffset: xOffset,
      yLookAt: yLookAt,
      lerpSpeed: lerp,
      rotation: rotation,
      duration: duration,
      ease: "power3.inOut",
    });
  }

  mooveCameraLevel1() {
    this.tutorial = document.getElementById("tutorial");

    gsap.to(this.tutorial, {
      opacity: 0,
      duration: 2,
      ease: "power3.inOut",
    });

    this.mooveCamera(
      this.cameraScenesValues.scene1.zOffset,
      this.cameraScenesValues.scene1.xOffset,
      this.cameraScenesValues.scene1.yLookAt,
      this.cameraScenesValues.scene1.lerpSpeed,
      4.5,
      this.cameraScenesValues.scene1.rotation
    );
  }

  level1(position) {
    if (!this.storedPositions.cam1) {
      this.storedPositions.cam1 = position.clone();
    }

    this.levelTwo = new Particles(
      () => this.mooveCameraLevel1(),
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
      () => {
        this.mooveCamera(
          this.cameraScenesValues.scene2.zOffset,
          this.cameraScenesValues.scene2.xOffset,
          this.cameraScenesValues.scene2.yLookAt,
          this.cameraScenesValues.scene2.lerpSpeed,
          4.5,
          this.cameraScenesValues.scene2.rotation
        );

        if (this.character && this.character.setReflectionOpacity) {
          this.character.setReflectionOpacity(0.5);
        }
      },
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
  }

  endGame(isFalling) {
    if (this.isEnded) return;
    if (!this.isStarted) return;
    this.isEnded = true;
    this.isStarted = false;
    this.isFalling = isFalling;

    if (this.experience.audioManager) {
      this.experience.audioManager.stopTickingSound();
    }

    const gradientObj = { percent: 0 };

    gsap.to(this.gameOver, {
      opacity: 1,
      duration: 0.4,
      ease: "power3.inOut",
    });

    // const tomb = this.gameOver.querySelector("#tombeGameOver");
    // const fog = this.gameOver.querySelector("#fogGameOver");

    const deadVideo = this.isFalling
      ? this.gameOver.querySelector("#deadVideo")
      : this.gameOver.querySelector("#deadVideo2");

    gsap.fromTo(
      deadVideo,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 2,
        ease: "power3.out",
        delay: 2,
        onComplete: () => {
          deadVideo.currentTime = 0;

          deadVideo.play();
        },
      }
    );
    // gsap.fromTo(
    //   tomb,
    //   {
    //     opacity: 0,
    //     y: 50,
    //   },
    //   {
    //     y: 20,
    //     opacity: 1,
    //     duration: 2,
    //     ease: "power3.out",
    //     delay: 2,
    //   }
    // );
    gsap.to(gradientObj, {
      percent: 100,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => {
        this.gameOver.style.background = `radial-gradient(circle, rgba(0,0,0,${
          gradientObj.percent / 100
        }) 0%, rgba(0,0,0,${gradientObj.percent / 90}) 100%)`;
      },

      // onStart: () => {
      //   setTimeout(() => {}, 2500);
      // },

      onComplete: () => {
        this.startGame(null, null);
        // gsap.to(tomb, {
        //   opacity: 0,
        //   duration: 2,
        //   ease: "power3.out",
        //   delay: 4,
        // });

        gsap.to(deadVideo, {
          opacity: 0,
          duration: 2,
          ease: "power3.out",
          delay: 4,
        });

        gsap.to(this.gameOver, {
          opacity: 0,
          duration: 3,
          delay: 6,
          ease: "power3.out",
        });
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
    if (this.jump) this.jump.update();
  }
}
