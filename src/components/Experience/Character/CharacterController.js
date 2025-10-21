import EventEmitter from "../Utils/EventEmitter.js";

export default class CharacterController extends EventEmitter {
  constructor(character) {
    super();

    this.character = character;
    this.inputManager = character.inputManager;

    this._isGrounded = false;
    this._isMoving = false;
    this._isRunning = false;
    this.wasMoving = false;

    this.maxJumps = 2;
    this.jumpsRemaining = this.maxJumps;

    this.walkSpeed = 0.5;
    this.runSpeed = 1;
    this.jumpForce = 0.001;

    this.setupInputListeners();
  }

  setupInputListeners() {
    if (!this.inputManager) {
      console.warn("CharacterController: No InputManager available");
      return;
    }

    this.inputManager.on("jump", () => this.handleJump());
    this.inputManager.on("run:start", () => this.handleRunStart());
    this.inputManager.on("run:end", () => this.handleRunEnd());
  }

  handleRunStart() {
    this._isRunning = true;
    if (this._isMoving) {
      this.trigger("startRunning");
    }
  }

  handleRunEnd() {
    this._isRunning = false;
    if (this._isMoving) {
      this.trigger("startWalking");
    }
  }

  handleJump() {
    if (this.jumpsRemaining > 0) {
      const jumpsBeforeJump = this.jumpsRemaining;
      this.trigger("jump", [{ jumpsRemaining: jumpsBeforeJump }]);
    }
  }

  handleInput() {
    if (!this.inputManager) return;

    const horizontalAxis = this.inputManager.getHorizontalAxis();
    const isCurrentlyMoving = Math.abs(horizontalAxis) > 0.01;
    const isRunning = this.inputManager.isRunning();

    const wasRunning = this._isRunning;
    this._isRunning = isRunning;

    if (isCurrentlyMoving && !this.wasMoving) {
      this._isMoving = true;
      if (isRunning) {
        this.trigger("startRunning");
      } else {
        this.trigger("startWalking");
      }
    } else if (!isCurrentlyMoving && this.wasMoving) {
      this._isMoving = false;
      this.trigger("stopMoving");
      this.trigger("idle");
    } else if (isCurrentlyMoving && this._isMoving) {
      if (isRunning && !wasRunning) {
        this.trigger("startRunning");
      } else if (!isRunning && wasRunning) {
        this.trigger("startWalking");
      }
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
      this.jumpsRemaining = this.maxJumps;
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

  getJumpsRemaining() {
    return this.jumpsRemaining;
  }

  update() {
    this.handleInput();
  }

  destroy() {}
}
