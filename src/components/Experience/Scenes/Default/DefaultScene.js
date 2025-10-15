import * as THREE from "three";
import Scene from "../Scene.js";
import Cube from "./Cube/Cube.js";
import Environement from "./Environment.js";
import Terrain from "./World/Terrain.js";

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

  onAllReady() {
    this.environement = new Environement();
    this.terrain = new Terrain();
    this.cube = new Cube(new THREE.Vector3(0, 20, -2));
    // this.plane = new Plane();

    this.experience.eventEmitter?.trigger("scene.ready");
  }

  update() {
    if (this.cube) this.cube.update();
    if (this.environement) this.environement.update?.();
  }
}
