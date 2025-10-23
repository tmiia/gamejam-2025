import * as THREE from "three";
import FallingIntoLanding from "./Animations/FallingIntoLanding.js";
import IdleAnimation from "./Animations/idle.js";
import JumpAnimation from "./Animations/jump.js";
import LandingAnimation from "./Animations/Landing.js";
import RunAnimation from "./Animations/Run.js";
import WalkAnimation from "./Animations/Walk.js";

export default class AnimationController {
  constructor(character) {
    this.character = character;
    this.model = character.model;
    this.reflectionModel = character.reflectionModel;
    this.resources = character.resources;

    this.mixer = null;
    this.reflectionMixer = null;
    this.animations = {};
    this.reflectionAnimations = {};
    this.animationClasses = {};
    this.reflectionAnimationClasses = {};
    this.currentAction = null;
    this.currentReflectionAction = null;
    this.previousAnimation = null;

    this.init();
    this.setupEventListeners();
  }

  init() {
    if (!this.model) {
      console.warn("AnimationController: No model provided");
      return;
    }

    this.mixer = new THREE.AnimationMixer(this.model);

    this.animationClasses.idle = new IdleAnimation(this);
    this.animationClasses.run = new RunAnimation(this);
    this.animationClasses.walk = new WalkAnimation(this);
    this.animationClasses.jump = new JumpAnimation(this);
    this.animationClasses.landing = new LandingAnimation(this);
    this.animationClasses.fallingIntoLanding = new FallingIntoLanding(this);

    if (this.animationClasses.idle.isLoaded) {
      this.animations.idle = this.animationClasses.idle.getAction();
    }
    if (this.animationClasses.run.isLoaded) {
      this.animations.run = this.animationClasses.run.getAction();
    }
    if (this.animationClasses.walk.isLoaded) {
      this.animations.walk = this.animationClasses.walk.getAction();
    }
    if (this.animationClasses.jump.isLoaded) {
      this.animations.jump = this.animationClasses.jump.getAction();
    }
    if (this.animationClasses.fallingIntoLanding.isLoaded) {
      this.animations.fallingIntoLanding =
        this.animationClasses.fallingIntoLanding.getAction();
    }
    if (this.animationClasses.landing.isLoaded) {
      this.animations.landing = this.animationClasses.landing.getAction();
    }

    if (this.reflectionModel) {
      this.reflectionMixer = new THREE.AnimationMixer(this.reflectionModel);
      
      const tempModel = this.model;
      const tempMixer = this.mixer;
      this.model = this.reflectionModel;
      this.mixer = this.reflectionMixer;
      
      this.reflectionAnimationClasses.idle = new IdleAnimation(this);
      this.reflectionAnimationClasses.run = new RunAnimation(this);
      this.reflectionAnimationClasses.walk = new WalkAnimation(this);
      this.reflectionAnimationClasses.jump = new JumpAnimation(this);
      this.reflectionAnimationClasses.landing = new LandingAnimation(this);
      this.reflectionAnimationClasses.fallingIntoLanding = new FallingIntoLanding(this);
      
      this.model = tempModel;
      this.mixer = tempMixer;

      if (this.reflectionAnimationClasses.idle.isLoaded) {
        this.reflectionAnimations.idle = this.reflectionAnimationClasses.idle.getAction();
      }
      if (this.reflectionAnimationClasses.run.isLoaded) {
        this.reflectionAnimations.run = this.reflectionAnimationClasses.run.getAction();
      }
      if (this.reflectionAnimationClasses.walk.isLoaded) {
        this.reflectionAnimations.walk = this.reflectionAnimationClasses.walk.getAction();
      }
      if (this.reflectionAnimationClasses.jump.isLoaded) {
        this.reflectionAnimations.jump = this.reflectionAnimationClasses.jump.getAction();
      }
      if (this.reflectionAnimationClasses.fallingIntoLanding.isLoaded) {
        this.reflectionAnimations.fallingIntoLanding =
          this.reflectionAnimationClasses.fallingIntoLanding.getAction();
      }
      if (this.reflectionAnimationClasses.landing.isLoaded) {
        this.reflectionAnimations.landing = this.reflectionAnimationClasses.landing.getAction();
      }
    }

    if (this.animations.idle) {
      this.playAnimation("idle");
    }
  }

  setupEventListeners() {
    if (this.character.characterController) {
      this.character.characterController.on("startWalking", () => {
        if (this.character.movementController?.isPlayingLandingAnimation) {
          return;
        }
        this.playAnimation("walk");
      });

      this.character.characterController.on("startRunning", () => {
        if (this.character.movementController?.isPlayingLandingAnimation) {
          return;
        }
        this.playAnimation("run");
      });

      this.character.characterController.on("stopMoving", () => {
        if (this.character.movementController?.isPlayingLandingAnimation) {
          return;
        }
        this.playAnimation("idle");
      });

      this.character.characterController.on("jump", () => {
        this.playAnimation("jump", { loop: THREE.LoopOnce });
      });

      this.character.characterController.on("landing", () => {
        this.playAnimation("landing", { loop: THREE.LoopOnce });

        const action = this.animations.landing;
        if (action) {
          const onFinished = () => {
            this.character.movementController.isPlayingLandingAnimation = false;
            this.checkInputAndPlayAnimation();
            this.mixer.removeEventListener("finished", onFinished);
          };
          this.mixer.addEventListener("finished", onFinished);
        }
      });
    }

    if (this.character.movementController) {
      this.character.movementController.on("fallingIntoLanding", () => {
        this.playAnimation("fallingIntoLanding", { loop: THREE.LoopOnce });

        const action = this.animations.fallingIntoLanding;
        if (action) {
          const onFinished = () => {
            if (this.character.movementController) {
              this.character.movementController.isPlayingLandingAnimation = false;
            }
            this.checkInputAndPlayAnimation();
            this.mixer.removeEventListener("finished", onFinished);
          };
          this.mixer.addEventListener("finished", onFinished);
        }
      });
    }
  }

  checkInputAndPlayAnimation() {
    if (!this.character.characterController) return;

    if (
      this.character.experience.sceneManager.currentScene.gameManager
        .isStarted === false
    )
      return;

    console.log("Checking input to determine animation");

    const horizontalInput =
      this.character.characterController.getHorizontalInput();
    const isRunning = this.character.characterController._isRunning;

    if (Math.abs(horizontalInput) > 0.01) {
      if (isRunning) {
        this.playAnimation("run");
      } else {
        this.playAnimation("walk");
      }
    } else {
      this.playAnimation("idle");
    }
  }

  playAnimation(name, options = {}) {
    const {
      fadeInDuration = 0.2,
      loop = THREE.LoopRepeat,
      timeScale = 1.0,
    } = options;

    const action = this.animations[name];

    if (!action) {
      console.warn(`AnimationController: Animation '${name}' not found`);
      return;
    }

    if (this.currentAction === action && action.isRunning()) {
      return;
    }

    if (this.currentAction && this.currentAction !== action) {
      this.currentAction.fadeOut(fadeInDuration);
    }

    action.reset();
    action.setLoop(loop);
    action.timeScale = timeScale;
    action.fadeIn(fadeInDuration);
    action.play();

    if (loop === THREE.LoopOnce) {
      action.clampWhenFinished = true;
    }

    this.previousAnimation = this.currentAction;
    this.currentAction = action;

    if (this.reflectionAnimations[name]) {
      const reflectionAction = this.reflectionAnimations[name];
      
      if (this.currentReflectionAction && this.currentReflectionAction !== reflectionAction) {
        this.currentReflectionAction.fadeOut(fadeInDuration);
      }

      reflectionAction.reset();
      reflectionAction.setLoop(loop);
      reflectionAction.timeScale = timeScale;
      reflectionAction.fadeIn(fadeInDuration);
      reflectionAction.play();

      if (loop === THREE.LoopOnce) {
        reflectionAction.clampWhenFinished = true;
      }

      this.currentReflectionAction = reflectionAction;
    }
  }

  stopAnimation(name, fadeOutDuration = 0.2) {
    const action = this.animations[name];

    if (!action) {
      console.warn(`AnimationController: Animation '${name}' not found`);
      return;
    }

    if (action.isRunning()) {
      action.fadeOut(fadeOutDuration);
      setTimeout(() => {
        action.stop();
      }, fadeOutDuration * 1000);
    }

    if (this.currentAction === action) {
      this.currentAction = null;
    }
  }

  getCurrentAnimation() {
    if (!this.currentAction) return null;

    for (const [name, action] of Object.entries(this.animations)) {
      if (action === this.currentAction) {
        return name;
      }
    }

    return null;
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
    if (this.reflectionMixer) {
      this.reflectionMixer.update(delta);
    }
  }

  destroy() {
    Object.values(this.animationClasses).forEach((animClass) => {
      if (animClass && animClass.destroy) {
        animClass.destroy();
      }
    });

    Object.values(this.reflectionAnimationClasses).forEach((animClass) => {
      if (animClass && animClass.destroy) {
        animClass.destroy();
      }
    });

    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.model);
    }

    if (this.reflectionMixer) {
      this.reflectionMixer.stopAllAction();
      this.reflectionMixer.uncacheRoot(this.reflectionModel);
    }

    this.animations = {};
    this.reflectionAnimations = {};
    this.animationClasses = {};
    this.reflectionAnimationClasses = {};
    this.currentAction = null;
    this.currentReflectionAction = null;
    this.previousAnimation = null;
  }
}
