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
    this.audioManager = this.experience.audioManager;
    this.camera = this.experience.camera.instance;
    this.scene = this.experience.sceneManager.currentScene.scene;

    this.position = position;

    this.rigidbody = null;
    this.collider = null;
    this.model = null;
    this.mapModel = null;

    this.raycaster = new THREE.Raycaster();
    this.isGrounded = false;

    this.setModel();
    this.setPhysics();
    // this.setSunLight();

    this.characterController = new CharacterController(this);
    this.movementController = new MovementController(this);
    this.animationController = new AnimationController(this);
    this.cameraSettings =
      this.experience.sceneManager.currentScene.gameManager.cameraSettings;

    this.setupAudioListeners();

    this.characterController.on("jump", (force) => {
      if (this.movementController) {
        this.movementController.jump(force);
      }
    });

    this.setMapReference();
  }

  setModel() {
    const characterModel = this.resources.items.characterModel;

    if (characterModel) {
      this.model = characterModel;
      this.model.scale.set(0.0025, 0.0025, 0.0025);
      this.model.position.copy(this.position);

      const blackMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#000000"),
        roughness: 1,
        metalness: 0,
      });

      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = blackMaterial;
        }
      });
      this.scene.add(this.model);
    }
  }

  setPhysics() {
    if (!this.physicsWorld || !this.physicsWorld.getWorld()) {
      console.warn("PhysicsWorld is not initialized");
      return;
    }
    const halfSize = { x: 0.25, y: 0.25, z: 0.5 };

    const bodyDesc = RAPIER.RigidBodyDesc.dynamic();
    bodyDesc.setTranslation(this.position.x, this.position.y, this.position.z);

    this.rigidbody = this.physicsWorld.getWorld().createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(
      halfSize.x,
      halfSize.y,
      halfSize.z
    )
      .setFriction(0.0)
      .setRestitution(0.0);

    this.collider = this.physicsWorld
      .getWorld()
      .createCollider(colliderDesc, this.rigidbody);

    this.rigidbody.setLinearDamping(0.5);
    this.rigidbody.setAngularDamping(1.0);

    this.rigidbody.lockRotations(true, true);
    this.rigidbody.lockTranslations(false, false, true);

    if (this.debug?.active) {
      const geometry = new THREE.BoxGeometry(
        halfSize.x * 2,
        halfSize.y * 2,
        halfSize.z * 2
      );
      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
      });

      this.debugCollider = new THREE.Mesh(geometry, material);
      this.scene.add(this.debugCollider);
    }
  }

  setSunLight() {
    // this.directionalLight = new THR^EE.DirectionalLight("#ffffff", 4);
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

  setMapReference() {
    const mapResource = this.resources.items.mapModel;
    if (mapResource && mapResource.scene) {
      this.mapModel = mapResource.scene;
    }
  }

  setupAudioListeners() {
    if (!this.characterController || !this.audioManager) return;

    this.characterController.on("startWalking", () => {
      this.audioManager.startWalkSound();
    });

    this.characterController.on("startRunning", () => {
      this.audioManager.startRunSound();
    });

    this.characterController.on("stopMoving", () => {
      this.audioManager.stopWalkSound();
    });

    this.characterController.on("jump", () => {
      this.audioManager.muteSound("walk");
      this.audioManager.playJump();
    });

    this.characterController.on("landed", () => {
      this.audioManager.playLanding();
      this.audioManager.unmuteSound("walk");
    });
  }

  checkGroundedWithRaycaster(raycastDistance, isLanding) {
    this.raycastDistance = raycastDistance || 0.75;
    if (!this.rigidbody || !this.mapModel) {
      return false;
    }

    const charPos = this.rigidbody.translation();
    const rayOrigin = new THREE.Vector3(charPos.x, charPos.y, charPos.z);

    const rayDirection = new THREE.Vector3(0, -2, 0);
    this.raycaster.set(rayOrigin, rayDirection);

    const intersects = this.raycaster.intersectObject(this.mapModel, true);

    if (intersects.length > 0) {
      const distance = intersects[0].distance;
      const vel = this.rigidbody.linvel();
      // const isGrounded =
      //   distance <= this.raycastDistance && isLanding
      //     ? Math.abs(vel.y) < 0.1
      //     : true;
      const isGrounded = distance <= this.raycastDistance;

      // console.log("Raycast Grounded Check:", {
      //   distance: distance,
      //   raycastDistance: this.raycastDistance,
      //   velY: vel.y,
      //   isGrounded: isGrounded,
      // });

      return isGrounded;
    }

    return false;
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

    if (
      this.model.position.y < -10 &&
      !this.experience.sceneManager.currentScene.gameManager.isEnded
    ) {
      this.experience.sceneManager.currentScene.gameManager.endGame();
    }

    if (this.debugCollider && this.rigidbody) {
      const pos = this.rigidbody.translation();
      this.debugCollider.position.set(pos.x, pos.y, pos.z);
    }

    if (this.camera && this.model) {
      if (!this.lookAtTarget) {
        this.lookAtTarget = new Vector3();
      }

      const targetLookAt = new Vector3(
        this.model.position.x + this.cameraSettings.xOffset,
        this.model.position.y * this.cameraSettings.yMultiplier +
          this.cameraSettings.yLookAt,
        this.model.position.z
      );

      this.lookAtTarget.lerp(targetLookAt, this.cameraSettings.lerpSpeed);
      this.camera.lookAt(this.lookAtTarget);

      this.camera.position.lerp(
        new Vector3(
          this.model.position.x + this.cameraSettings.xOffset,
          this.model.position.y * this.cameraSettings.yMultiplier,
          this.model.position.z + this.cameraSettings.zOffset
        ),
        this.cameraSettings.lerpSpeed
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
