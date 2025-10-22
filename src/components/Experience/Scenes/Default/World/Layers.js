import * as THREE from "three";
import Experience from "../../../Experience.js";

export default class Layers {
  constructor() {
    this.experience = new Experience();

    this.layers = {
      1: {
        zPosition: -31,
        yPosition: 5,
        xPosition: 0,
        metalness: 0,
        roughness: 1,
      },
      2: {
        zPosition: -32,
        yPosition: 5,
        xPosition: 0,
        metalness: 0,
        roughness: 1,
      },
      3: {
        zPosition: -33,
        yPosition: 5,
        xPosition: 0,
        metalness: 0,
        roughness: 1,
      },
      4: {
        zPosition: -34,
        yPosition: 5,
        xPosition: 0,
        metalness: 0,
        roughness: 1,
      },
      5: {
        zPosition: -35,
        yPosition: 5,
        xPosition: 0,
        metalness: 0,
        roughness: 1,
      },
      6: {
        zPosition: -36,
        yPosition: 5,
        xPosition: 0,
        metalness: 0,
        roughness: 1,
      },
      7: {
        zPosition: -37,
        yPosition: 5,
        xPosition: 0,
        metalness: 0,
        roughness: 1,
      },
      8: {
        zPosition: -38,
        yPosition: 5,
        xPosition: 0,
        metalness: 1,
        roughness: 0,
      },
    };
    this.ressource = this.experience.resources;
    this.debug = this.experience.debug;

    this.createAllLayers();
  }

  createAllLayers() {
    this.layerMeshes = {};
    for (let i = 1; i <= Object.keys(this.layers).length; i++) {
      this.layerMeshes[i] = this.createLayer(i);
    }
  }

  createLayer(number) {
    const layerData = this.layers[number];
    if (!layerData) {
      console.warn(`Layer ${number} n'existe pas.`);
      return null;
    }

    const texture = this.ressource.items[`layer${number}`];
    texture.colorSpace = THREE.SRGBColorSpace;
    const planeWidth = texture.image.width / 100;
    const planeHeight = texture.image.height / 100;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    const material = new THREE.MeshBasicMaterial({
      map: texture,

      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    // this.model.position.set(0, -10, -2);
    // this.model.rotation.y = -Math.PI / 2;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = layerData.zPosition;
    mesh.position.y = layerData.yPosition;
    mesh.position.x = layerData.xPosition;
    mesh.rotationY = Math.PI / 2;
    // mesh.renderOrder = -10 - number;
    this.experience.sceneManager.currentScene.scene.add(mesh);

    if (this.debug?.active) {
      let debugFolder = this.debug.ui.addFolder(`Layer ${number} Debug`);
      debugFolder
        .add(mesh.position, "z")
        .name("Position Z")
        .min(layerData.zPosition - 100)
        .max(layerData.zPosition + 100)
        .step(0.1);

      debugFolder
        .add(mesh.position, "y")
        .name("Position Y")
        .min(-50)
        .max(50)
        .step(0.1);

      debugFolder
        .add(mesh.position, "x")
        .name("Position X")
        .min(-50)
        .max(50)
        .step(0.1);

      debugFolder.open();
    }

    return mesh;
  }
}
