import EventEmitter from "../Utils/EventEmitter.js";

export default class CharacterController extends EventEmitter {
  constructor(character) {
    super();

    this.character = character;
    this.inputManager = character.inputManager;

    this._isGrounded = false;
    this._isMoving = false;
    this._isRunning = false;
    this.canJump = true;
    this.wasMoving = false;

    this.walkSpeed = 5;
    this.runSpeed = 8;
    this.jumpForce = 15;

    this.setupInputListeners();
  }

  setupInputListeners() {
    if (!this.inputManager) {
      console.warn("CharacterController: No InputManager available");
      return;
    }

    this.inputManager.on("jump", () => this.handleJump());
  }

  handleJump() {
    if (this._isGrounded && this.canJump) {
      this.trigger("jump", { force: this.jumpForce });
    }
  }

  handleInput() {
    if (!this.inputManager) return;

    const horizontalAxis = this.inputManager.getHorizontalAxis();
    const isCurrentlyMoving = Math.abs(horizontalAxis) > 0.01;

    if (isCurrentlyMoving && !this.wasMoving) {
      this._isMoving = true;
      this.trigger("startMoving");
    } else if (!isCurrentlyMoving && this.wasMoving) {
      // this._isMoving = false;
      // this.trigger("stopMoving");
      // TODO: Implement idle animation instead of stopMoving
    }

    this.wasMoving = isCurrentlyMoving;
  }

  checkMovement() {
    const horizontalAxis = this.getHorizontalInput();
    const wasMoving = this._isMoving;
    
    this._isMoving = Math.abs(horizontalAxis) > 0.01;
    
    if (!wasMoving && this._isMoving) {
      this.trigger("startMoving");
    } else if (wasMoving && !this._isMoving) {
      this.trigger("stopMoving");
    }
  }

  getCurrentSpeed() {
    if (!this._isMoving) return 0;
    return this._isRunning ? this.runSpeed : this.walkSpeed;
  }

  get isGrounded() {
    return this._isGrounded;
  }

  getHorizontalInput() {
    if (!this.inputManager) return 0;
    return this.inputManager.getHorizontalAxis();
  }

  setGrounded(value) {
    const wasGrounded = this._isGrounded;
    this._isGrounded = value;

    if (!wasGrounded && value) {
      this.trigger("landed");
    } else if (wasGrounded && !value) {
      this.trigger("airborne");
    }
  }

  getIsMoving() {
    return this._isMoving;
  }

  getIsGrounded() {
    return this._isGrounded;
  }

  getMoveSpeed() {
    return this._isRunning ? this.runSpeed : this.walkSpeed;
  }

  getJumpForce() {
    return this.jumpForce;
  }

  update() {
    this.handleInput();
  }

  destroy() {}
}

