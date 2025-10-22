import * as THREE from "three";
import Experience from "../../../Experience.js";

export default class Ghost {
  constructor() {
    this.experience = new Experience();

    this.ressource = this.experience.resources;
    this.debug = this.experience.debug;
    this.ghost = null;

    this.createGhost();
  }

  createGhost() {
    const texture = this.ressource.items.ghost;
    texture.colorSpace = THREE.SRGBColorSpace;
    const planeWidth = texture.image.width / 600;
    const planeHeight = texture.image.height / 600;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.ghost = new THREE.Mesh(geometry, material);
    this.ghost.position.set(0, 0, -8);
    this.ghost.rotationY = Math.PI / 2;
    this.ghost.visible = false;
    this.experience.sceneManager.currentScene.scene.add(this.ghost);

    if (this.debug?.active) {
      let debugFolder = this.debug.ui.addFolder(`Ghost Debug`);
      debugFolder
        .add(this.ghost.position, "z")
        .name("Position Z")
        .min(1 - 100)
        .max(1 + 100)
        .step(0.1);

      debugFolder
        .add(this.ghost.position, "y")
        .name("Position Y")
        .min(-50)
        .max(50)
        .step(0.1);

      debugFolder
        .add(this.ghost.position, "x")
        .name("Position X")
        .min(-50)
        .max(50)
        .step(0.1);

      debugFolder.open();
    }

    return this.ghost;
  }
}
