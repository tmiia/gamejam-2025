import * as THREE from "three";
import Experience from "../../../Experience.js";

export default class Background {
  constructor() {
    this.experience = new Experience();
    this.resources = this.experience.resources;
    this.scene = this.experience.sceneManager.currentScene.scene;

    this.resource = this.resources.items.background;

    this.debugObjects = [];

    this.setModel();
    this.initFog();
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.position.set(0, -10, -2);
    this.model.rotation.y = -Math.PI / 2;
    this.scene.add(this.model);
  }

  initFog() {
    this.scene.fog = new THREE.Fog(0x000000, 10, 50);
  }
  destroy() {
    if (this.model) this.scene.remove(this.model);

    if (this.bodies.length > 0 && this.experience.physicsWorld?.getWorld()) {
      this.bodies.forEach((body) => {
        this.experience.physicsWorld.getWorld().removeRigidBody(body);
      });
    }
  }
}
