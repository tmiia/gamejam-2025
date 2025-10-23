import Character from "../../Character/Character.js";
import Scene from "../Scene.js";
import BloodParticles from "./CompsGameplay/BloodShaders/BloodParticles.js";
import Environement from "./Environment.js";
import BloodManager from "./Game/BloodManager.js";
import GameManager from "./Game/GameManager.js";
import Ghost from "./World/Ghost.js";
import Layers from "./World/Layers.js";
import Terrain from "./World/Terrain.js";

import * as THREE from "three";

export default class DefaultScene extends Scene {
  constructor() {
    super();
    this.objectsToCreate = [];
  }

  init() {
    this.resources = this.experience.resources;
    this.physicsWorld = this.experience.physicsWorld;

    const resourcesReady = this.resources.toLoad === this.resources.loaded;
    const physicsReady = this.physicsWorld.world !== null;

    if (resourcesReady && physicsReady) {
      this.onAllReady();
    } else {
      if (!resourcesReady) {
        this.resources.on("loaded", () => this.checkAllReady());
      }

      if (!physicsReady) {
        this.physicsWorld.on("ready", () => this.checkAllReady());
      }
    }
  }

  checkAllReady() {
    const resourcesReady = this.resources.toLoad === this.resources.loaded;
    const physicsReady = this.physicsWorld.world !== null;

    if (resourcesReady && physicsReady) {
      this.onAllReady();
    }
  }

  fuckmia() {
    alert("fuckmia");
  }

  onAllReady() {
    this.environement = new Environement();
    this.ghost = new Ghost();
    this.gameManager = new GameManager();
    this.character = new Character(new THREE.Vector3(-8.311140060424805, 5, 0));
    this.terrain = new Terrain();
    this.layers = new Layers();
    this.bloodParticles = new BloodParticles();
    this.bloodManager = new BloodManager();
    this.experience.eventEmitter?.trigger("scene.ready");
  }

  update() {
    // if (this.cube) this.cube.update();
    if (this.character) this.character.update();
    if (this.environement) this.environement.update?.();
    if (this.particles) this.particles.update();
    if (this.gameManager) this.gameManager.update?.();
    if (this.bloodManager) this.bloodManager.update?.();
    if (this.bloodParticles) this.bloodParticles.update();
  }
}
