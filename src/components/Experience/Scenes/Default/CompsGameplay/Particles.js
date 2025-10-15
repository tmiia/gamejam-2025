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
    this.geometry = new THREE.SphereGeometry(0.5, 8, 8);
  }

  setMaterial() {
    this.material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0, 2, -2);
    this.scene.add(this.mesh);
  }

  update() {
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.02;

    const defaultMesh = this.experience.sceneManager.currentScene.cube.mesh;

    if (defaultMesh && !this.isDeleted) {
      this.checkCollision(defaultMesh);
    }
  }

  deleteGeometry() {
    this.isDeleted = true;
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.mesh);
  }

  checkCollision(targetMesh) {
    const dx = this.mesh.position.x - targetMesh.position.x;
    const dz = this.mesh.position.z - targetMesh.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    const minDistance = 0.1;

    if (distance == 0) return;

    if (distance < minDistance) {
      this.deleteGeometry();
    }
  }
}
