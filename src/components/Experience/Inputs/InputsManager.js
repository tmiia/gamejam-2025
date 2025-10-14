import Axis from "axis-api";
import EventEmitter from "../Utils/EventEmitter.js";

export default class InputManager extends EventEmitter {
  constructor() {
    super();

    this.keys = {
      left: false,
      right: false,
      jump: false,
    };

    this.joystickValues = {
      joystick1: { x: 0, y: 0 },
      joystick2: { x: 0, y: 0 },
    };

    this.setupKeyboardEmulation();
    this.setupGamepadEmulation();
    this.setupEventListeners();
  }

  setupKeyboardEmulation() {
    Axis.registerKeys("q", "a", 1);
    Axis.registerKeys("d", "x", 1);
    Axis.registerKeys("z", "i", 1);
    Axis.registerKeys("s", "s", 1);
    Axis.registerKeys(" ", "w", 1);

    Axis.registerKeys("ArrowLeft", "a", 2);
    Axis.registerKeys("ArrowRight", "x", 2);
    Axis.registerKeys("ArrowUp", "i", 2);
    Axis.registerKeys("ArrowDown", "s", 2);
    Axis.registerKeys("Enter", "w", 2);
  }

  setupGamepadEmulation() {
    const checkGamepad = () => {
      const gamepads = navigator.getGamepads();
      if (gamepads[0]) {
        this.gamepadEmulator1 = Axis.createGamepadEmulator(0);
        Axis.joystick1.setGamepadEmulatorJoystick(this.gamepadEmulator1, 0);

        Axis.registerGamepadEmulatorKeys(this.gamepadEmulator1, 0, "w", 1);
      }

      if (gamepads[1]) {
        this.gamepadEmulator2 = Axis.createGamepadEmulator(1);
        Axis.joystick2.setGamepadEmulatorJoystick(this.gamepadEmulator2, 0);
        Axis.registerGamepadEmulatorKeys(this.gamepadEmulator2, 0, "w", 2);
      }
    };

    setTimeout(checkGamepad, 100);

    window.addEventListener("gamepadconnected", () => {
      console.log("Gamepad connecté");
      checkGamepad();
    });
  }

  setupEventListeners() {
    Axis.addEventListener("keydown", this.handleKeyDown.bind(this));
    Axis.addEventListener("keyup", this.handleKeyUp.bind(this));

    Axis.joystick1.addEventListener(
      "joystick:move",
      this.handleJoystick1Move.bind(this)
    );
    Axis.joystick2.addEventListener(
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

  update() {
    if (this.gamepadEmulator1) {
      this.gamepadEmulator1.update();
    }
    if (this.gamepadEmulator2) {
      this.gamepadEmulator2.update();
    }
  }

  destroy() {
    Axis.removeEventListener("keydown", this.handleKeyDown.bind(this));
    Axis.removeEventListener("keyup", this.handleKeyUp.bind(this));
    Axis.joystick1.removeEventListener(
      "joystick:move",
      this.handleJoystick1Move.bind(this)
    );
    Axis.joystick2.removeEventListener(
      "joystick:move",
      this.handleJoystick2Move.bind(this)
    );
  }
}
