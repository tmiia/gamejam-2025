import * as THREE from "three";

export default class RunAnimation {
  constructor(animationController) {
    this.animationController = animationController;
    this.character = animationController.character;
    this.resources = this.character.resources;
    
    this.action = null;
    this.isLoaded = false;
    
    this.init();
  }

  init() {
    const runAnim = this.resources.items.fastRunAnim;
    
    if (runAnim && runAnim.animations && runAnim.animations.length > 0) {
      const mixer = this.animationController.mixer;
      
      if (mixer) {
        this.action = mixer.clipAction(runAnim.animations[0]);
        this.action.setLoop(THREE.LoopRepeat);
        this.isLoaded = true;
      } else {
        console.warn("RunAnimation: No mixer available");
      }
    } else {
      console.warn("RunAnimation: No run animation found in resources");
    }
  }

  play(options = {}) {
    if (!this.action || !this.isLoaded) {
      console.warn("RunAnimation: Cannot play - animation not loaded");
      return;
    }

    const {
      fadeInDuration = 0.3,
      timeScale = 1.0
    } = options;

    this.animationController.playAnimation("run", {
      fadeInDuration,
      loop: THREE.LoopRepeat,
      timeScale
    });
  }

  stop(fadeOutDuration = 0.3) {
    if (!this.action || !this.isLoaded) {
      return;
    }

    this.animationController.stopAnimation("run", fadeOutDuration);
  }

  isPlaying() {
    return this.action && this.action.isRunning();
  }

  getAction() {
    return this.action;
  }

  destroy() {
    if (this.action) {
      this.action.stop();
      this.action = null;
    }
    
    this.isLoaded = false;
  }
}

