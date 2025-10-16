import RAPIER from "@dimforge/rapier3d-compat";
import EventEmitter from "../Utils/EventEmitter.js";

export default class MovementController extends EventEmitter {
  constructor(character) {
    super();

    this.character = character;
    this.characterController = character.characterController;
    this.rigidbody = character.rigidbody;
    this.model = character.model;
    this.physicsWorld = character.physicsWorld;

    this.walkSpeed = 4;
    this.runSpeed = 8;
    this.jumpForce = 6;
    this.doubleJumpForce = 13;

    this.groundFriction = 0.8;
    this.airFriction = 0.95;

    this.modelYOffset = -1.0;

    this.lastJumpTime = 0;
    this.isDoubleJumping = false;
    this.minJumpInterval = 100;
    this.raycastDistance = 1.3;

    this.setupJumpListener();
  }

  setupJumpListener() {
    if (this.characterController) {
      this.characterController.on("jump", (data) => {
        this.jump(data.jumpsRemaining);
      });
    }
  }

  checkGrounded() {
    if (!this.rigidbody || !this.character) return;
    const isGrounded = this.character.checkGroundedWithRaycaster(
      this.raycastDistance,
      true
    );

    if (this.characterController) {
      this.characterController.setGrounded(isGrounded);
    }
  }

  checkBeforeGrounded() {
    if (!this.rigidbody || !this.character) return;

    const vel = this.rigidbody.linvel();
    const isNearGround = this.character.checkGroundedWithRaycaster(1, false);

    if (this.isDoubleJumping) {
      if (isNearGround && vel.y < -3.5) {
        console.log("Double Jump ended");
        this.trigger("fallingIntoLanding");
        this.isDoubleJumping = false;
      }
    }
  }

  handleMovement() {
    if (!this.rigidbody || !this.characterController) return;

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
      this.applyFriction();
    }
  }

  applyFriction() {
    if (!this.rigidbody) return;

    const currentVel = this.rigidbody.linvel();
    const isGrounded = this.characterController?.getIsGrounded() || false;

    const friction = isGrounded ? this.groundFriction : this.airFriction;

    this.rigidbody.setLinvel(
      new RAPIER.Vector3(currentVel.x * friction, currentVel.y, currentVel.z),
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

    const jumpForceToUse =
      this.characterController.jumpsRemaining === 1
        ? this.doubleJumpForce
        : this.jumpForce;

    if (this.characterController.jumpsRemaining == 1) {
      console.log("Double Jump!");
      this.isDoubleJumping = true;
    }

    this.rigidbody.setLinvel(
      new RAPIER.Vector3(currentVel.x, 0, currentVel.z),
      true
    );

    this.characterController.jumpsRemaining--;

    this.rigidbody.applyImpulse({ x: 0.0, y: jumpForceToUse, z: 0.0 }, true);
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

  update() {
    this.checkGrounded();
    this.checkBeforeGrounded();
    this.handleMovement();
    this.syncModelPosition();
  }

  destroy() {
    this.rigidbody = null;
    this.model = null;
    this.character = null;
    this.characterController = null;
  }
}
