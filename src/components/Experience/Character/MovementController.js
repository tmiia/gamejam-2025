import RAPIER from "@dimforge/rapier3d-compat";

export default class MovementController {
  constructor(character) {
    this.character = character;
    this.characterController = character.characterController;
    this.rigidbody = character.rigidbody;
    this.model = character.model;
    this.physicsWorld = character.physicsWorld;

    this.walkSpeed = 4;
    this.runSpeed = 8;
    this.jumpForce = 12;
    this.doubleJumpForce = 50;

    this.groundFriction = 0.8;
    this.airFriction = 0.95;

    this.modelYOffset = -1.0;

    this.lastJumpTime = 0;
    this.minJumpInterval = 100;

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

    const isGrounded = Math.abs(vel.y) < 0.1 && pos.y <= 0.01;

    if (this.characterController) {
      this.characterController.setGrounded(isGrounded);
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
