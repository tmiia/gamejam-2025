import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import { Vector3 } from "three";
import Experience from "../Experience.js";
import AnimationController from "./AnimationController.js";
import CharacterController from "./CharacterController.js";
import MovementController from "./MovementController.js";
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

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
    this.reflectionModel = null;
    this.mapModel = null;
    this.reflectionOffset = 2.05;
    this.targetReflectionOpacity = 0;
    this.reflectionMaterial = null;

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
    if (!characterModel) {
      console.warn("Character model not found in resources");
      return;
    }
  
    this.model = clone(characterModel);
    this.model.scale.set(0.0025, 0.0025, 0.0025);
    this.model.position.copy(this.position);
  
    const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.model.traverse((child) => {
      if (child.isMesh) child.material = blackMaterial;
    });
    this.scene.add(this.model);
  
    this.reflectionModel = clone(this.model);
    this.reflectionModel.scale.copy(this.model.scale);
    this.reflectionModel.scale.y = -0.0025;
    this.reflectionModel.position.copy(this.model.position);
    this.reflectionModel.position.x -= this.reflectionOffset;
    
    this.reflectionMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0
    });
    
    this.reflectionModel.traverse((child) => {
      if (child.isMesh) {
        child.material = this.reflectionMaterial;
      }
    });
    
    this.scene.add(this.reflectionModel);
  
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

  setReflectionOpacity(opacity) {
    this.targetReflectionOpacity = opacity;
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

  syncModelPosition() {
    if (!this.rigidbody || !this.model) return;

    const translation = this.rigidbody.translation();

    this.model.position.set(
      translation.x,
      translation.y + this.modelYOffset,
      translation.z
    );
  }

  update() {
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

      // Apply camera rotation (convert degrees to radians)
      const targetRotation = (this.cameraSettings.rotation * Math.PI) / 180;
      this.camera.rotation.z = THREE.MathUtils.lerp(
        this.camera.rotation.z,
        targetRotation,
        this.cameraSettings.lerpSpeed
      );
    }
    // this.syncModelPosition();

    if (
      this.experience.sceneManager.currentScene.gameManager.isStarted === false
    ) {
      this.movementController.syncModelPosition();
      return;
    }

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

    if (this.reflectionModel && this.model) {
      this.reflectionModel.position.x = this.model.position.x;
      this.reflectionModel.position.y = -this.model.position.y - this.reflectionOffset;
      this.reflectionModel.position.z = this.model.position.z;

      this.reflectionModel.rotation.copy(this.model.rotation);
      
      const targetOpacity = this.model.position.y < -1 ? 0 : (this.targetReflectionOpacity !== undefined ? this.targetReflectionOpacity : 0);
      if (this.reflectionMaterial) {
        this.reflectionMaterial.opacity = targetOpacity;
      }
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

    if (this.reflectionModel) {
      this.scene.remove(this.reflectionModel);
    }

    if (this.rigidbody && this.physicsWorld?.getWorld()) {
      this.physicsWorld.getWorld().removeRigidBody(this.rigidbody);
    }

    if (this.debugFolder) {
      this.debug.ui.removeFolder(this.debugFolder);
    }
  }
}
