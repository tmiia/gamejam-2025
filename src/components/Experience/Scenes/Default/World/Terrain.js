import * as THREE from "three";
import Experience from "../../../Experience.js";

export default class Terrain {
  constructor() {
    this.experience = new Experience();
    this.resources = this.experience.resources;
    this.scene = this.experience.sceneManager.currentScene.scene;
    this.collisionManager = this.experience.collisionManager;

    this.resource = this.resources.items.mapModel;
    this.resourceCube = this.resources.items.mapModelPhysics;

    this.bodies = [];
    this.debugObjects = [];

    this.setModel();
    this.execCollider();
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.position.set(0, -0.5, 0);
    // this.model.scale.set(5, 5, 5);
    this.model.rotation.y = -Math.PI / 2;
    this.scene.add(this.model);

    const blackMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#000000"),
      roughness: 1,
      metalness: 0,
    });

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.name === "END") {
          child.visible = false;
          this.experience.sceneManager.currentScene.gameManager.initParticles(
            child.getWorldPosition(new THREE.Vector3())
          );

          return;
        }

        if (child.name === "CAM_1") {
          this.experience.sceneManager.currentScene.gameManager.level1(
            child.getWorldPosition(new THREE.Vector3())
          );
          child.visible = false;

          return;
        }

        if (child.name === "CAM_2") {
          this.experience.sceneManager.currentScene.gameManager.level2(
            child.getWorldPosition(new THREE.Vector3())
          );
          child.visible = false;

          return;
        }

        if (child.name === "GHOST001") {
          this.experience.sceneManager.currentScene.gameManager.animateCrazyGhotst(
            child.getWorldPosition(new THREE.Vector3())
          );
          child.visible = false;

          return;
        }

        if (child.name === "START") {
          this.character = this.experience.sceneManager.currentScene.character;
          this.experience.sceneManager.currentScene.gameManager.startGame(
            child.getWorldPosition(new THREE.Vector3()),
            this.character
          );
          child.visible = false;
          return;
        }

        if (child.name === "Plane") {
          return;
        }

        if (
          child.name.includes("Plateform") ||
          child.name.includes("Platform")
        ) {
          child.material = blackMaterial;
        }
        if (child.name.includes("Reflect")) {
          child.visible = false;
        }
      }
    });

    this.physicalMap = this.resourceCube.scene;
    this.physicalMap.position.set(0, -0.5, 0);
    this.physicalMap.rotation.y = -Math.PI / 2;

    this.physicalMap.visible = false;
    this.scene.add(this.physicalMap);
  }

  execCollider() {
    this.bodies = this.collisionManager.createColliderFromModel(
      this.physicalMap
    );
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
