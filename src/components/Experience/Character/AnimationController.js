import * as THREE from "three";
import IdleAnimation from "./Animations/idle.js";
import RunAnimation from "./Animations/Run.js";
import WalkAnimation from "./Animations/Walk.js";

export default class AnimationController {
  constructor(character) {
    this.character = character;
    this.model = character.model;
    this.resources = character.resources;

    this.mixer = null;
    this.animations = {};
    this.animationClasses = {};
    this.currentAction = null;
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

    // Initialize animation classes
    this.animationClasses.idle = new IdleAnimation(this);
    this.animationClasses.run = new RunAnimation(this);
    this.animationClasses.walk = new WalkAnimation(this);

    // Register actions from animation classes
    if (this.animationClasses.idle.isLoaded) {
      this.animations.idle = this.animationClasses.idle.getAction();
    }
    if (this.animationClasses.run.isLoaded) {
      this.animations.run = this.animationClasses.run.getAction();
    }
    if (this.animationClasses.walk.isLoaded) {
      this.animations.walk = this.animationClasses.walk.getAction();
    }

    // Start with idle animation
    if (this.animations.idle) {
      this.playAnimation("idle");
    }
  }

  setupEventListeners() {
    if (this.character.characterController) {
      this.character.characterController.on("startWalking", () => {
        this.playAnimation("walk");
      });

      this.character.characterController.on("startRunning", () => {
        this.playAnimation("run");
      });

      this.character.characterController.on("stopMoving", () => {
        this.playAnimation("idle");
      });
      this.character.characterController.on("jump", () => {
        this.playAnimation("jump", { loop: THREE.LoopOnce });
      });
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
  }

  destroy() {
    // Destroy animation classes
    Object.values(this.animationClasses).forEach((animClass) => {
      if (animClass && animClass.destroy) {
        animClass.destroy();
      }
    });

    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.model);
    }

    this.animations = {};
    this.animationClasses = {};
    this.currentAction = null;
    this.previousAnimation = null;
  }
}
