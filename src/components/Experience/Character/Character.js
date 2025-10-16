import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import { Vector3 } from "three";
import Experience from "../Experience.js";
import AnimationController from "./AnimationController.js";
import CharacterController from "./CharacterController.js";
import MovementController from "./MovementController.js";

export default class Character {
  constructor(position = new Vector3(0, 0, 0)) {
    this.experience = new Experience();
    this.scene = this.experience.sceneManager.currentScene.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;
    this.physicsWorld = this.experience.physicsWorld;
    this.inputManager = this.experience.inputManager;
    this.camera = this.experience.camera.instance;
    this.scene = this.experience.sceneManager.currentScene.scene;

    this.position = position;

    this.rigidbody = null;
    this.collider = null;
    this.model = null;

    this.setModel();
    this.setPhysics();
    // this.setSunLight();

    this.characterController = new CharacterController(this);
    this.movementController = new MovementController(this);
    this.animationController = new AnimationController(this);

    this.characterController.on("jump", (force) => {
      if (this.movementController) {
        this.movementController.jump(force);
      }
    });
  }

  setModel() {
    const characterModel = this.resources.items.characterModel;

    if (characterModel) {
      this.model = characterModel;
      this.model.scale.set(0.01, 0.01, 0.01);
      this.model.position.copy(this.position);
      this.scene.add(this.model);
    }
  }

  setPhysics() {
    if (!this.physicsWorld || !this.physicsWorld.getWorld()) {
      console.warn("PhysicsWorld is not initialized");
      return;
    }

    const radius = 0.5;
    const height = 1.5;

    const bodyDesc = RAPIER.RigidBodyDesc.dynamic();
    bodyDesc.setTranslation(this.position.x, this.position.y, this.position.z);

    this.rigidbody = this.physicsWorld.getWorld().createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.capsule(height / 2, radius);
    this.collider = this.physicsWorld
      .getWorld()
      .createCollider(colliderDesc, this.rigidbody);

    this.rigidbody.setLinearDamping(0.5);
    this.rigidbody.setAngularDamping(1.0);

    this.rigidbody.lockRotations(true, true);

    this.rigidbody.lockTranslations(false, false, true, true);
  }
  setSunLight() {
    // this.directionalLight = new THREE.DirectionalLight("#ffffff", 4);
    // this.directionalLight.castShadow = true;
    // this.directionalLight.shadow.camera.far = 15;
    // this.directionalLight.shadow.mapSize.set(1024, 1024);
    // this.scene.add(this.directionalLight);

    this.pointLight = new THREE.PointLight("#ffffff", 10, 30);
    // this.pointLight.castShadow = true;
    // this.pointLight.shadow.mapSize.set(1024, 1024);
    // this.pointLight.shadow.bias = -0.0001;

    this.pointLight.position.set(0, 2, 0);
    this.scene.add(this.pointLight);
  }

  update() {
    if (this.characterController) {
      this.characterController.update();
    }

    if (this.movementController) {
      this.movementController.update();
    }

    if (this.animationController) {
      const delta = this.experience.time.delta * 0.001;
      this.animationController.update(delta);
    }
    // if (this.pointLight && this.model) {
    //   this.pointLight.position.set(
    //     this.model.position.x,
    //     this.model.position.y + 3,
    //     this.model.position.z
    //   );
    // }

    if (this.camera && this.model) {
      this.camera.lookAt(
        this.model.position.x,
        this.model.position.y - 0.5,
        this.model.position.z
      );
      this.camera.position.lerp(
        new Vector3(
          this.model.position.x,
          this.model.position.y - 0.5,
          this.model.position.z + 30
        ),
        0.05
      );
    }
  }

  destroy() {
    if (this.characterController) {
      this.characterController.destroy();
    }

    if (this.movementController) {
      this.movementController.destroy();
    }

    if (this.animationController) {
      this.animationController.destroy();
    }

    if (this.model) {
      this.scene.remove(this.model);
    }

    if (this.rigidbody && this.physicsWorld?.getWorld()) {
      this.physicsWorld.getWorld().removeRigidBody(this.rigidbody);
    }

    if (this.debugFolder) {
      this.debug.ui.removeFolder(this.debugFolder);
    }
  }
}
