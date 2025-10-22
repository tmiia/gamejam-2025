import * as THREE from "three";
import Experience from "../../Experience.js";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.sceneManager.currentScene.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    // this.setSunLight();
    // this.setLighting();
    // this.setEnvironmentMap();
  }
  setLighting() {
    this.ambientLight = new THREE.AmbientLight("#ffffff", 0.4);

    this.scene.add(this.ambientLight);

    // this.directionalLight = new THREE.Directio
  }

  setSunLight() {
    this.sunLight = new THREE.DirectionalLight("#ffffff", 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 15;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(3.5, 2, -1.25);
    this.scene.add(this.sunLight);

    this.sunLightTwo = new THREE.DirectionalLight("#ffffff", 10);
    this.sunLightTwo.shadow.mapSize.set(1024, 1024);
    this.sunLightTwo.position.set(0, 0, 6.25);
    this.scene.add(this.sunLightTwo);
  }
}
