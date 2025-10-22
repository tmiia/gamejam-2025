import * as THREE from "three";

export default class LandingAnimation {
  constructor(animationController) {
    this.animationController = animationController;
    this.character = animationController.character;
    this.resources = this.character.resources;

    this.action = null;
    this.isLoaded = false;

    this.init();
  }

  init() {
    const landingAnim = this.resources.items.landingAnim;

    if (landingAnim?.animations?.length > 0) {
      const mixer = this.animationController.mixer;
      if (mixer) {
        this.action = mixer.clipAction(landingAnim.animations[0]);
        this.isLoaded = true;
      } else {
        console.warn("LandingAnimation: No mixer available");
      }
    } else {
      console.warn(
        "LandingAnimation: No landingAnim animation found in resources"
      );
    }
  }

  play(options = {}) {
    if (!this.action || !this.isLoaded) return;

    const { fadeInDuration = 0.2, timeScale = 1.0 } = options;

    this.animationController.playAnimation("landing", {
      fadeInDuration,
      loop: THREE.LoopOnce,
      timeScale,
    });

    this.action.clampWhenFinished = true;

    const onFinished = () => {
      this.animationController.checkInputAndPlayAnimation();
      this.animationController.mixer.removeEventListener(
        "finished",
        onFinished
      );
    };
    this.animationController.mixer.addEventListener("finished", onFinished);
  }

  stop(fadeOutDuration = 0.3) {
    if (!this.action || !this.isLoaded) {
      return;
    }

    this.animationController.stopAnimation("landing", fadeOutDuration);
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
