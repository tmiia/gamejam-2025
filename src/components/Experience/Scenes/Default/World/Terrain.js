import Experience from "../../../Experience.js";
export default class Terrain {
  constructor() {
    this.experience = new Experience();
    this.resources = this.experience.resources;
    this.scene = this.experience.sceneManager.currentScene.scene;

    this.resource = this.resources.items.mapModel;

    this.setModel();
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.position.set(0, -3.5, 0);
    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }
}

import * as THREE from "three";
