import * as THREE from "three";
import Scene from "../Scene.js";
import Particles from "./CompsGameplay/Particles.js";
import Cube from "./Cube/Cube.js";
import Environement from "./Environment.js";
import Terrain from "./World/Terrain.js";
import Character from "../../Character/Character.js";

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
    this.terrain = new Terrain();
    // this.cube = new Cube(new THREE.Vector3(-10, 2, -2));
    this.character = new Character(new THREE.Vector3(0, 2, 0));
    this.particles = new Particles(this.fuckmia);
    // this.character = new Character();
    // this.plane = new Plane();

    this.experience.eventEmitter?.trigger("scene.ready");
  }

  update() {
    // if (this.cube) this.cube.update();
    if (this.character) this.character.update();
    if (this.environement) this.environement.update?.();
    if (this.particles) this.particles.update();
  }
}
