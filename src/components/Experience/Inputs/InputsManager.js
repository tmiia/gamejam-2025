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
      joystick2: { x: 0, y: 0 },
    };

    this.Axis = null;
    this.gamepadEmulator1 = null;
    this.gamepadEmulator2 = null;

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
    
    this.Axis.registerKeys("q", "a", 1);      
    this.Axis.registerKeys("d", "x", 1);      
    this.Axis.registerKeys("z", "i", 1);      
    this.Axis.registerKeys("s", "s", 1);      
    this.Axis.registerKeys(" ", "w", 1);      
      
    this.Axis.registerKeys("ArrowLeft", "a", 2);
    this.Axis.registerKeys("ArrowRight", "x", 2);
    this.Axis.registerKeys("ArrowUp", "i", 2);
    this.Axis.registerKeys("ArrowDown", "s", 2);
    this.Axis.registerKeys("Enter", "w", 2);
  }

  setupGamepadEmulation() {
    if (!this.Axis) return;
    
    const checkGamepad = () => {
      const gamepads = navigator.getGamepads();
      if (gamepads[0]) {
        this.gamepadEmulator1 = this.Axis.createGamepadEmulator(0);
        this.Axis.joystick1.setGamepadEmulatorJoystick(this.gamepadEmulator1, 0);

        this.Axis.registerGamepadEmulatorKeys(this.gamepadEmulator1, 0, "w", 1);
        this.Axis.registerGamepadEmulatorKeys(this.gamepadEmulator1, 1, "u", 1); 
      }

      if (gamepads[1]) {
        this.gamepadEmulator2 = this.Axis.createGamepadEmulator(1);
        this.Axis.joystick2.setGamepadEmulatorJoystick(this.gamepadEmulator2, 0);
        this.Axis.registerGamepadEmulatorKeys(this.gamepadEmulator2, 0, "w", 2);
      }
    };

    setTimeout(checkGamepad, 100);

    window.addEventListener("gamepadconnected", () => {
      console.log("Gamepad connecté");
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
    this.Axis.joystick2.addEventListener(
      "joystick:move",
      this.handleJoystick2Move.bind(this)
    );
  }

  handleKeyDown(e) {
    if (e.key === "a") {
      this.keys.left = true;
      this.trigger("move:left:start");
    }

    if (e.key === "x") {
      this.keys.right = true;
      this.trigger("move:right:start");
    }

    if (e.key === "w") {
      this.keys.jump = true;
      this.trigger("jump");
    }

    if (e.key === "i") {
      this.keys.run = true;
      this.trigger("run:start");
    }
  }

  handleKeyUp(e) {
    if (e.key === "a") {
      this.keys.left = false;
      this.trigger("move:left:end");
    }

    if (e.key === "x") {
      this.keys.right = false;
      this.trigger("move:right:end");
    }

    if (e.key === "w") {
      this.keys.jump = false;
    }

    if (e.key === "i") {
      this.keys.run = false;
      this.trigger("run:end");
    }
  }

  handleJoystick1Move(e) {
    this.joystickValues.joystick1.x = e.position.x;
    this.joystickValues.joystick1.y = e.position.y;
    this.trigger("joystick:move", { id: 1, ...e });
  }

  handleJoystick2Move(e) {
    this.joystickValues.joystick2.x = e.position.x;
    this.joystickValues.joystick2.y = e.position.y;
    this.trigger("joystick:move", { id: 2, ...e });
  }

  getHorizontalAxis() {
    let axis = 0;

    const joystick1X = this.joystickValues.joystick1.x;
    const joystick2X = this.joystickValues.joystick2.x;

    if (Math.abs(joystick1X) > 0.1) {
      axis = joystick1X;
    } else if (Math.abs(joystick2X) > 0.1) {
      axis = joystick2X;
    } else {
      if (this.keys.left) axis -= 1;
      if (this.keys.right) axis += 1;
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
    if (this.gamepadEmulator2) {
      this.gamepadEmulator2.update();
    }
  }

  destroy() {
    if (!this.Axis) return;
    
    this.Axis.removeEventListener("keydown", this.handleKeyDown.bind(this));
    this.Axis.removeEventListener("keyup", this.handleKeyUp.bind(this));
    this.Axis.joystick1.removeEventListener(
      "joystick:move",
      this.handleJoystick1Move.bind(this)
    );
    this.Axis.joystick2.removeEventListener(
      "joystick:move",
      this.handleJoystick2Move.bind(this)
    );
  }
}
