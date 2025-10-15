import * as THREE from "three";
import Experience from "../../../Experience.js";

export default class Particles {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.sceneManager.currentScene.scene;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }
  setGeometry() {
    this.geometry = new THREE.SphereGeometry(1, 16, 16);
  }
  setMaterial() {
    this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  }
  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0, 2, -2);
    this.scene.add(this.mesh);
  }
}
