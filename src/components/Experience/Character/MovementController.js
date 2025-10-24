import RAPIER from "@dimforge/rapier3d-compat";
import EventEmitter from "../Utils/EventEmitter.js";

export default class MovementController extends EventEmitter {
  constructor(character) {
    super();

    this.character = character;
    this.characterController = character.characterController;
    this.animationController = character.animationController;
    this.rigidbody = character.rigidbody;
    this.model = character.model;
    this.modelReflect = character.modelReflect;
    this.physicsWorld = character.physicsWorld;

    this.walkSpeed = 10;
    this.runSpeed = 4;
    this.normalJumpForce = 0.85;
    this.criticalJumpForce = 0.55;
    this.jumpForce = this.normalJumpForce;
    this.doubleJumpForce = 1;

    this.groundFriction = 0.8;
    this.airFriction = 0.95;

    this.modelYOffset = -0.25;

    this.lastJumpTime = 0;
    this.isDoubleJumping = false;
    this.minJumpInterval = 100;
    this.raycastDistance = 0.3;

    this.isLanding = false;
    this.isPlayingLandingAnimation = false;

    this.setupJumpListener();
    this.setupLandingAnimationListener();
  }

  setupJumpListener() {
    if (this.characterController) {
      this.characterController.on("jump", (data) => {
        this.jump(data.jumpsRemaining);
      });
    }
  }

  setupLandingAnimationListener() {
    if (this.characterController) {
      this.characterController.on("landing", () => {
        this.isPlayingLandingAnimation = true;
      });
    }
  }

  updateJumpForceBasedOnBloodLevel() {
    const bloodManager = this.character?.experience?.sceneManager?.currentScene?.bloodManager;
    
    if (bloodManager) {
      this.jumpForce = bloodManager.isCriticalState 
        ? this.criticalJumpForce 
        : this.normalJumpForce;
    }
  }

  checkGrounded() {
    if (!this.rigidbody || !this.character) return;
    const isGrounded = this.character.checkGroundedWithRaycaster(
      this.raycastDistance,
      true
    );

    if (!isGrounded && !this.isLanding) {
      this.isLanding = true;
    }
    if (isGrounded && this.isLanding) {
      this.isLanding = false;

      if (this.characterController) {
        this.characterController.trigger("landing");
      }
    }

    if (this.characterController) {
      this.characterController.setGrounded(isGrounded);
    }
  }

  handleMovement(delta) {
    if (!this.rigidbody || !this.characterController) return;

    if (this.isPlayingLandingAnimation) {
      this.applyFriction(delta);
      return;
    }

    const horizontalAxis = this.characterController.getHorizontalInput();
    const currentSpeed = this.characterController.getCurrentSpeed();

    if (Math.abs(horizontalAxis) > 0.01) {
      const currentVel = this.rigidbody.linvel();

      this.rigidbody.setLinvel(
        new RAPIER.Vector3(
          horizontalAxis * currentSpeed,
          currentVel.y,
          currentVel.z
        ),
        true
      );

      this.updateModelRotation(horizontalAxis);
    } else {
      this.applyFriction(delta);
    }
  }

  applyFriction(delta) {
    if (!this.rigidbody) return;

    const currentVel = this.rigidbody.linvel();
    const isGrounded = this.characterController?.getIsGrounded() || false;

    const friction = isGrounded ? this.groundFriction : this.airFriction;
    
    // Calculate frame-rate independent friction
    // Convert milliseconds to seconds and apply exponential decay
    const deltaSeconds = delta / 1000;
    const frictionFactor = Math.pow(friction, deltaSeconds * 60);

    this.rigidbody.setLinvel(
      new RAPIER.Vector3(currentVel.x * frictionFactor, currentVel.y, currentVel.z),
      true
    );
  }

  updateModelRotation(direction) {
    if (!this.model) return;

    if (direction > 0) {
      this.model.rotation.y = Math.PI / 2;
    } else if (direction < 0) {
      this.model.rotation.y = -Math.PI / 2;
    }
  }

  jump(jumpsRemainingBeforeJump) {
    if (!this.rigidbody || !this.characterController) return;

    const now = performance.now();
    if (now - this.lastJumpTime < this.minJumpInterval) {
      return;
    }
    this.lastJumpTime = now;

    const currentVel = this.rigidbody.linvel();

    if (this.characterController.jumpsRemaining == 1) {
      this.isDoubleJumping = true;
    }

    this.rigidbody.setLinvel(
      new RAPIER.Vector3(currentVel.x, 0, currentVel.z),
      true
    );

    this.characterController.jumpsRemaining--;

    this.rigidbody.applyImpulse({ x: 0.0, y: this.jumpForce, z: 0.0 }, true);
  }

  syncModelPosition() {
    if (!this.rigidbody || !this.model) return;

    const translation = this.rigidbody.translation();

    this.model.position.set(
      translation.x,
      translation.y + this.modelYOffset,
      translation.z
    );
  }

  update(delta) {
    this.updateJumpForceBasedOnBloodLevel();
    this.syncModelPosition();
    this.checkGrounded();
    this.handleMovement(delta);
  }

  destroy() {
    this.rigidbody = null;
    this.model = null;
    this.character = null;
    this.characterController = null;
  }
}
