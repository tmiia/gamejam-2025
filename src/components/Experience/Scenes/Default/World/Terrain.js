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
    this.model.position.set(0, -3.5, 0);
    // this.model.scale.set(5, 5, 5);
    this.model.rotation.y = -Math.PI / 2;
    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.cube = this.resourceCube.scene;
    this.cube.position.set(0, -3.5, 0);
    this.cube.rotation.y = -Math.PI / 2;
    // this.cube.scale.set(5, 5, 5);
    this.cube.visible = false;
    this.scene.add(this.cube);
  }

  execCollider() {
    this.bodies = this.collisionManager.createColliderFromModel(this.cube);
    console.log(`${this.bodies.length} collider(s) créé(s) pour le terrain`);
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
