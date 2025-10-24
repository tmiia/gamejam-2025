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

    this.gamepadIndex = null;
    this.deadzone = 0.15; // Zone morte du joystick

    // Bind methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleGamepadConnected = this.handleGamepadConnected.bind(this);
    this.handleGamepadDisconnected = this.handleGamepadDisconnected.bind(this);

    // Initialiser les listeners
    if (typeof window !== "undefined") {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Clavier
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    // Gamepad
    window.addEventListener("gamepadconnected", this.handleGamepadConnected);
    window.addEventListener(
      "gamepaddisconnected",
      this.handleGamepadDisconnected
    );

    console.log("✅ Input listeners attached (Arrows + ZQSD)");
  }

  handleGamepadConnected(e) {
    console.log("🎮 Gamepad connected:", e.gamepad.id);
    this.gamepadIndex = e.gamepad.index;
  }

  handleGamepadDisconnected(e) {
    console.log("🎮 Gamepad disconnected");
    if (this.gamepadIndex === e.gamepad.index) {
      this.gamepadIndex = null;
      this.joystickValues.joystick1.x = 0;
      this.joystickValues.joystick1.y = 0;
    }
  }

  handleKeyDown(e) {
    // Flèches directionnelles ET ZQSD pour gauche/droite
    if (e.key === "ArrowLeft" || e.key === "q" || e.key === "Q") {
      this.keys.left = true;
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      this.keys.right = true;
    }

    // Z, ArrowUp = Sprint
    if (e.key === "z" || e.key === "Z" || e.key === "ArrowUp") {
      if (!this.keys.run) {
        this.keys.run = true;
        console.log("🏃 Sprint start (Z/↑)");
        this.trigger("run:start");
      }
    }

    // Espace = Sauter
    if (e.key === " ") {
      if (!this.keys.jump) {
        this.keys.jump = true;
        console.log("🦘 Jump (Space)");
        this.trigger("jump");
      }
    }

    // Audio effects (debug)
    if (e.key === "m" || e.key === "M") {
      console.log("🔊 Applying muffle effect to ambiance...");
      if (typeof window !== "undefined" && window.experience) {
        window.experience.audioManager.applyMuffledEffect("ambiance", 200);
      }
    }

    if (e.key === "u" || e.key === "U") {
      console.log("🔊 Removing muffle effect from ambiance...");
      if (typeof window !== "undefined" && window.experience) {
        window.experience.audioManager.removeMuffledEffect("ambiance");
      }
    }

    // 🟡 NOUVEAU : touche Y = retour à l'ascenseur
    if (e.key === "y" || e.key === "Y") {
      console.log("🚪 Retour à l’ascenseur (touche Y)");
      if (typeof window !== "undefined" && window.parent) {
        window.parent.postMessage(
          { type: "elevator-command", action: "backToElevator" },
          "*"
        );
      }
    }
  }

  handleKeyUp(e) {
    // Flèches directionnelles ET ZQSD pour gauche/droite
    if (e.key === "ArrowLeft" || e.key === "q" || e.key === "Q") {
      this.keys.left = false;
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      this.keys.right = false;
    }

    // Z, ArrowUp = Sprint
    if (e.key === "z" || e.key === "Z" || e.key === "ArrowUp") {
      this.keys.run = false;
      console.log("🛑 Sprint end");
      this.trigger("run:end");
    }

    // Espace = Sauter
    if (e.key === " ") {
      this.keys.jump = false;
    }
  }

  pollGamepad() {
    if (this.gamepadIndex === null) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[this.gamepadIndex];
    if (!gamepad) return;

    // Joystick gauche (axes 0 et 1)
    const axisX =
      Math.abs(gamepad.axes[0]) > this.deadzone ? gamepad.axes[0] : 0;
    const axisY =
      Math.abs(gamepad.axes[1]) > this.deadzone ? gamepad.axes[1] : 0;

    const prevX = this.joystickValues.joystick1.x;
    const prevY = this.joystickValues.joystick1.y;

    this.joystickValues.joystick1.x = axisX;
    this.joystickValues.joystick1.y = axisY;

    if (prevX !== axisX || prevY !== axisY) {
      this.trigger("joystick:move", {
        id: 1,
        position: { x: axisX, y: axisY },
      });
    }

    // Bouton 0 (A) = Sauter
    if (gamepad.buttons[0] && gamepad.buttons[0].pressed) {
      if (!this.keys.jump) {
        this.keys.jump = true;
        console.log("🦘 Jump (Gamepad A)");
        this.trigger("jump");
      }
    } else if (this.keys.jump) {
      this.keys.jump = false;
    }

    // Bouton 2 (X) = Sprint
    if (gamepad.buttons[2] && gamepad.buttons[2].pressed) {
      if (!this.keys.run) {
        this.keys.run = true;
        console.log("🏃 Sprint start (Gamepad X)");
        this.trigger("run:start");
      }
    } else if (this.keys.run && !this.isKeyboardRunning()) {
      this.keys.run = false;
      console.log("🛑 Sprint end (Gamepad)");
      this.trigger("run:end");
    }
  }

  isKeyboardRunning() {
    return false;
  }

  getHorizontalAxis() {
    let axis = 0;
    const joystick1X = this.joystickValues.joystick1.x;
    if (Math.abs(joystick1X) > 0.1) axis = joystick1X;
    else if (this.keys.left) axis = -1;
    else if (this.keys.right) axis = 1;
    return axis;
  }

  isJumping() {
    return this.keys.jump;
  }

  isRunning() {
    return this.keys.run;
  }

  update() {
    this.pollGamepad();
  }

  destroy() {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", this.handleKeyDown);
      window.removeEventListener("keyup", this.handleKeyUp);
      window.removeEventListener(
        "gamepadconnected",
        this.handleGamepadConnected
      );
      window.removeEventListener(
        "gamepaddisconnected",
        this.handleGamepadDisconnected
      );
    }
    console.log("✅ Input manager destroyed");
  }
}
