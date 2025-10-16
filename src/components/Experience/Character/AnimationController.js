import * as THREE from "three";

export default class AnimationController {
  constructor(character) {
    this.character = character;
    this.model = character.model;
    this.resources = character.resources;

    this.mixer = null;
    this.animations = {};
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

    const idleAnim = this.resources.items.idleAnim;
    if (idleAnim && idleAnim.animations && idleAnim.animations.length > 0) {
      this.animations.idle = this.mixer.clipAction(idleAnim.animations[0]);
    }

    const fastRunAnim = this.resources.items.fastRunAnim;
    if (
      fastRunAnim &&
      fastRunAnim.animations &&
      fastRunAnim.animations.length > 0
    ) {
      this.animations.run = this.mixer.clipAction(fastRunAnim.animations[0]);
    }

    const jump = this.resources.items.jump;
    if (jump && jump.animations && jump.animations.length > 0) {
      this.animations.jump = this.mixer.clipAction(jump.animations[0]);
      this.animations.loop = THREE.LoopOnce;
    }

    // const fastRunAnim = this.resources.items.fastRunAnim;
    // if (fastRunAnim && fastRunAnim.animations && fastRunAnim.animations.length > 0) {
    //   this.animations.run = this.mixer.clipAction(fastRunAnim.animations[0]);
    // }

    if (this.animations.idle) {
      this.playAnimation("idle");
    }
  }

  setupEventListeners() {
    if (this.character.characterController) {
      this.character.characterController.on("startMoving", () => {
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
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.model);
    }

    this.animations = {};
    this.currentAction = null;
    this.previousAnimation = null;
  }
}
