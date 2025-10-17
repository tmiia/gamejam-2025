import EventEmitter from "../Utils/EventEmitter.js";

export default class InputManager extends EventEmitter {
  constructor() {
    super();

    this.keys = {
      left: false,
      right: false,
      jump: false,
      run: false,
    };

    this.joystickValues = {
      joystick1: { x: 0, y: 0 },
    };

    this.Axis = null;
    this.gamepadEmulator1 = null;

    // Only initialize Axis API on the client side
    if (typeof window !== 'undefined') {
      this.initAxisAPI();
    }
  }

  async initAxisAPI() {
    try {
      const AxisModule = await import("axis-api");
      this.Axis = AxisModule.default;
      
      this.setupKeyboardEmulation();
      this.setupGamepadEmulation();
      this.setupEventListeners();
    } catch (error) {
      console.error("Error loading Axis API:", error);
    }
  }

  setupKeyboardEmulation() {
    if (!this.Axis) return;
    
    this.Axis.registerKeys(["ArrowUp", "z"], "a", 1);
    this.Axis.registerKeys(" ", "x", 1);

    this.setupKeyboardMovement();
  }

  setupKeyboardMovement() {
    window.addEventListener("keydown", this.handleDirectKeyDown.bind(this));
    window.addEventListener("keyup", this.handleDirectKeyUp.bind(this));
  }

  setupGamepadEmulation() {
    if (!this.Axis) return;
    
    const checkGamepad = () => {
      const gamepads = navigator.getGamepads();
      if (gamepads[0]) {
        this.gamepadEmulator1 = this.Axis.createGamepadEmulator(0);
        this.Axis.joystick1.setGamepadEmulatorJoystick(this.gamepadEmulator1, 0);

        this.Axis.registerGamepadEmulatorKeys(this.gamepadEmulator1, 0, "a", 1);
        this.Axis.registerGamepadEmulatorKeys(this.gamepadEmulator1, 2, "x", 1);
      }
    };

    setTimeout(checkGamepad, 100);

    window.addEventListener("gamepadconnected", () => {
      console.log("Gamepad connected");
      checkGamepad();
    });
  }

  setupEventListeners() {
    if (!this.Axis) return;
    
    this.Axis.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.Axis.addEventListener("keyup", this.handleKeyUp.bind(this));

    this.Axis.joystick1.addEventListener(
      "joystick:move",
      this.handleJoystick1Move.bind(this)
    );
  }

  handleDirectKeyDown(e) {
    if (e.key === "ArrowLeft") {
      this.keys.left = true;
    }
    if (e.key === "ArrowRight") {
      this.keys.right = true;
    }
  }

  handleDirectKeyUp(e) {
    if (e.key === "ArrowLeft") {
      this.keys.left = false;
    }
    if (e.key === "ArrowRight") {
      this.keys.right = false;
    }
  }

  handleKeyDown(e) {
    if (e.key === "a") {
      this.keys.run = true;
      console.log("run:start");
      
      this.trigger("run:start");
    }

    if (e.key === "x") {
      this.keys.jump = true;
      console.log("jump");
      this.trigger("jump");
    }
  }

  handleKeyUp(e) {
    if (e.key === "a") {
      this.keys.run = false;
      this.trigger("run:end");
    }

    if (e.key === "x") {
      this.keys.jump = false;
    }
  }

  handleJoystick1Move(e) {
    this.joystickValues.joystick1.x = e.position.x;
    this.joystickValues.joystick1.y = e.position.y;
    this.trigger("joystick:move", { id: 1, ...e });
  }

  getHorizontalAxis() {
    let axis = 0;

    const joystick1X = this.joystickValues.joystick1.x;
    if (Math.abs(joystick1X) > 0.1) {
      axis = joystick1X;
    }
    else if (this.keys.left) {
      axis = -1;
    } else if (this.keys.right) {
      axis = 1;
    }

    return axis;
  }

  isJumping() {
    return this.keys.jump;
  }

  isRunning() {
    return this.keys.run;
  }

  update() {
    if (this.gamepadEmulator1) {
      this.gamepadEmulator1.update();
    }
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener("keydown", this.handleDirectKeyDown.bind(this));
      window.removeEventListener("keyup", this.handleDirectKeyUp.bind(this));
    }

    if (!this.Axis) return;
    
    this.Axis.removeEventListener("keydown", this.handleKeyDown.bind(this));
    this.Axis.removeEventListener("keyup", this.handleKeyUp.bind(this));
    this.Axis.joystick1.removeEventListener(
      "joystick:move",
      this.handleJoystick1Move.bind(this)
    );
  }
}
