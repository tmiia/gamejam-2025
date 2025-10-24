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

    this.gamepadIndex = null;
    this.deadzone = 0.15; // Zone morte du joystick

    // Axis controller mapping
    this.axisMapping = {
      a: 'left',    // lane 0
      x: 'right',   // lane 1
      i: 'jump',    // lane 2
      s: 'run',     // lane 3
      w: null,      // lane 4 - reserved for future use
    };

    // Bind methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleGamepadConnected = this.handleGamepadConnected.bind(this);
    this.handleGamepadDisconnected = this.handleGamepadDisconnected.bind(this);
    this.handlePostMessage = this.handlePostMessage.bind(this);

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

    // PostMessage (Axis controller)
    window.addEventListener("message", this.handlePostMessage);

    console.log("✅ Input listeners attached (Arrows + ZQSD + Axis postMessage)");
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

  handlePostMessage(ev) {
    const msg = ev.data;
    
    // Filter only axis-event messages
    if (!msg || msg.type !== 'axis-event') return;

    console.log(`🎮 [Axis] Received: ${msg.event}`, msg.payload);

    // Handle keydown/keyup events from Axis controller
    if (msg.event === 'keydown' || msg.event === 'keyup') {
      this.handleAxisKeyEvent(msg.event, msg.payload);
    }

    // Handle joystick quickmove (discrete directions)
    if (msg.event === 'joystick:quickmove') {
      this.handleAxisJoystickQuick(msg.payload);
    }

    // Handle joystick move (analog values)
    if (msg.event === 'joystick:move') {
      this.handleAxisJoystickMove(msg.payload);
    }

    // Handle paste events (if needed in the future)
    if (msg.event === 'paste') {
      console.log('📋 Paste event received:', msg.payload.text);
    }
  }

  handleAxisKeyEvent(eventType, payload) {
    const rawKey = (payload?.key || '').toLowerCase();
    
    // Parse suffixed key (e.g., "a1" -> base: "a", controllerId: 1)
    const match = rawKey.match(/^([a-z]+)(\d+)$/);
    let baseKey = rawKey;
    let controllerId = payload?.id || 1;
    
    if (match) {
      baseKey = match[1];
      controllerId = parseInt(match[2], 10);
    }

    // Map Axis key to game action
    const action = this.axisMapping[baseKey];
    if (!action) {
      console.log(`⚠️ [Axis] Unmapped key: ${baseKey}`);
      return;
    }

    const isKeyDown = eventType === 'keydown';

    // Handle the action
    if (action === 'jump' && isKeyDown) {
      if (!this.keys.jump) {
        this.keys.jump = true;
        console.log(`🦘 Jump (Axis ${baseKey.toUpperCase()}${controllerId})`);
        this.trigger("jump");
      }
    } else if (action === 'jump' && !isKeyDown) {
      this.keys.jump = false;
    }

    if (action === 'run' && isKeyDown) {
      if (!this.keys.run) {
        this.keys.run = true;
        console.log(`🏃 Sprint start (Axis ${baseKey.toUpperCase()}${controllerId})`);
        this.trigger("run:start");
      }
    } else if (action === 'run' && !isKeyDown) {
      this.keys.run = false;
      console.log("🛑 Sprint end (Axis)");
      this.trigger("run:end");
    }

    if (action === 'left') {
      this.keys.left = isKeyDown;
    }

    if (action === 'right') {
      this.keys.right = isKeyDown;
    }
  }

  handleAxisJoystickQuick(payload) {
    const direction = payload?.direction;
    const joystickId = payload?.joystick || 1;
    
    console.log(`🕹️ [Axis] Joystick ${joystickId} quickmove: ${direction}`);
    
    // Map directions to temporary key presses
    // This simulates discrete movement
    if (direction === 'left') {
      this.keys.left = true;
      setTimeout(() => { this.keys.left = false; }, 100);
    } else if (direction === 'right') {
      this.keys.right = true;
      setTimeout(() => { this.keys.right = false; }, 100);
    }
  }

  handleAxisJoystickMove(payload) {
    const position = payload?.position || { x: 0, y: 0 };
    const joystickId = payload?.joystick || payload?.id || 1;
    
    // Apply deadzone
    const x = Math.abs(position.x) > this.deadzone ? position.x : 0;
    const y = Math.abs(position.y) > this.deadzone ? position.y : 0;

    // Store values for the appropriate joystick
    if (joystickId === 1) {
      this.joystickValues.joystick1.x = x;
      this.joystickValues.joystick1.y = y;
    } else if (joystickId === 2) {
      this.joystickValues.joystick2.x = x;
      this.joystickValues.joystick2.y = y;
    }

    // Emit event for other systems to use
    this.trigger("joystick:move", {
      id: joystickId,
      position: { x, y },
    });
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
    
    // Check joystick1 (gamepad or Axis controller)
    const joystick1X = this.joystickValues.joystick1.x;
    if (Math.abs(joystick1X) > 0.1) {
      axis = joystick1X;
    }
    // Check joystick2 (Axis controller only)
    else {
      const joystick2X = this.joystickValues.joystick2.x;
      if (Math.abs(joystick2X) > 0.1) {
        axis = joystick2X;
      }
    }
    
    // Fall back to keyboard/button inputs
    if (axis === 0) {
      if (this.keys.left) axis = -1;
      else if (this.keys.right) axis = 1;
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
      window.removeEventListener("message", this.handlePostMessage);
    }
    console.log("✅ Input manager destroyed");
  }
}
