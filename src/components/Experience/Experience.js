import Camera from "./Camera";
import Renderer from "./Renderer";
import DefaultScene from "./Scenes/Default/DefaultScene";
import SceneManager from "./Scenes/SceneManager.js";

import InputManager from "./Inputs/InputsManager.js";
import sources from "./sources.js";
import Debug from "./Utils/Debug.js";
import Resources from "./Utils/Resources.js";
import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time";

import AudioManager from "./Audio/AudioManager.js";
import CollisionManager from "./Physics/CollisionManager.js";
import PhysicsWorld from "./Physics/PhysicsWorld.js";
import PostProcessingClass from "./PostProcessing/PostProcessingClass.js";

export default class Experience {
  constructor(canvas, routerReplace) {
    if (Experience.instance) return Experience.instance;
    Experience.instance = this;

    // Global access
    window.experience = this;

    this.routerReplace = routerReplace;
    this.canvas = canvas;

    // Setup
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.resources = new Resources(sources, this.data);

    // Input Manager pour gérer les contrôles
    this.inputManager = new InputManager();

    // Audio Manager
    this.audioManager = new AudioManager();

    this.physicsWorld = new PhysicsWorld();
    this.collisionManager = new CollisionManager();

    this.camera = new Camera();
    this.sceneManager = new SceneManager(this);
    this.sceneManager.setScene(DefaultScene);
    this.renderer = new Renderer();
    this.postProcessing = new PostProcessingClass();

    // setTimeout(() => {
    //   this.postProcessing.triggerDamageEffect(0.5, 2000);
    // }, 2000);

    // Shared props
    this.isGalleryAnimated = true;

    // Resize
    this.sizes.on("resize", () => this.resize());

    // Tick
    this.time.on("tick", () => this.update());
  }

  navigateToPage(path) {
    this.routerReplace(path);
  }

  static resetInstance() {
    if (Experience.instance) {
      Experience.instance.destroy();
      Experience.instance = null;
    }
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    if (this.inputManager) {
      this.inputManager.update();
    }

    this.sceneManager.update();
    this.camera.update();
    this.renderer.update(this.sceneManager.currentScene.scene);

    if (this.physicsWorld) {
      this.physicsWorld.update();
    }
    if (this.postProcessing) {
      this.postProcessing.update();
    }
  }

  destroy() {
    this.sizes.off("resize");
    this.time.off("tick");

    if (this.inputManager) {
      this.inputManager.destroy();
    }

    if (this.audioManager) {
      this.audioManager.destroy();
    }

    if (this.sceneManager.currentScene) {
      this.sceneManager.currentScene.destroy();
    }

    if (this.camera.controls) this.camera.controls.dispose();
    if (this.renderer.instance) this.renderer.instance.dispose();

    if (this.debug.active) this.debug.ui.destroy();
  }
}
