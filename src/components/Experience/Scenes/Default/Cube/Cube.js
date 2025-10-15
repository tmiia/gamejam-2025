import RAPIER from "@dimforge/rapier3d-compat";
import { BoxGeometry, Mesh, ShaderMaterial, Vector3 } from "three";
import Experience from "../../../Experience.js";
import fragmentShader from "./fragmentShader.glsl";
import vertexShader from "./vertexShader.glsl";

export default class Cube {
  constructor(position = new Vector3(0, 0, 0), isDynamic = true) {
    this.experience = new Experience();
    this.scene = this.experience.sceneManager.currentScene.scene;
    this.debug = this.experience.debug;
    this.physicsWorld = this.experience.physicsWorld;
    this.inputManager = this.experience.inputManager;
    this.camera = this.experience.camera.instance;

    this.position = position;
    this.isDynamic = isDynamic;

    this.rigidbody = null;
    this.collider = null;

    this.moveSpeed = 8;
    this.jumpForce = 15;
    this.canJump = true;
    this.isGrounded = false;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setPhysics();
    this.setupInputListeners();
  }

  setGeometry() {
    this.geometry = new BoxGeometry(1, 1, 1);
  }

  setMaterial() {
    this.material = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
  }

  setMesh() {
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.copy(this.position);

    this.scene.add(this.mesh);
  }

  setPhysics() {
    if (!this.physicsWorld || !this.physicsWorld.getWorld()) {
      console.warn("PhysicsWorld n'est pas initialisé");
      return;
    }

    const hx = 0.5;
    const hy = 0.5;
    const hz = 0.5;

    const bodyDesc = this.isDynamic
      ? RAPIER.RigidBodyDesc.dynamic()
      : RAPIER.RigidBodyDesc.fixed();

    bodyDesc.setTranslation(this.position.x, this.position.y, this.position.z);

    this.rigidbody = this.physicsWorld.getWorld().createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(hx, hy, hz);
    this.collider = this.physicsWorld
      .getWorld()
      .createCollider(colliderDesc, this.rigidbody);

    this.rigidbody.setLinearDamping(0.5);
    this.rigidbody.setAngularDamping(1.0);

    this.rigidbody.lockRotations(true, true);

    this.rigidbody.lockTranslations(false, false, true, true);
  }

  setupInputListeners() {
    if (!this.inputManager) return;

    this.inputManager.on("jump", () => this.jump());
  }

  jump() {
    if (this.rigidbody && this.isDynamic && this.isGrounded) {
      const currentVel = this.rigidbody.linvel();
      this.rigidbody.setLinvel(
        new RAPIER.Vector3(currentVel.x, this.jumpForce, currentVel.z),
        true
      );
      this.isGrounded = false;
    }
  }

  checkGrounded() {
    if (this.rigidbody) {
      const vel = this.rigidbody.linvel();
      const pos = this.rigidbody.translation();

      if (Math.abs(vel.y) < 0.1 && pos.y < 1.0) {
        this.isGrounded = true;
      } else {
        this.isGrounded = false;
      }
    }
  }

  handleMovement() {
    if (!this.inputManager || !this.rigidbody || !this.isDynamic) return;

    const horizontalAxis = this.inputManager.getHorizontalAxis();

    if (Math.abs(horizontalAxis) > 0.01) {
      const currentVel = this.rigidbody.linvel();

      this.rigidbody.setLinvel(
        new RAPIER.Vector3(
          horizontalAxis * this.moveSpeed,
          currentVel.y,
          currentVel.z
        ),
        true
      );
    } else {
      const currentVel = this.rigidbody.linvel();
      this.rigidbody.setLinvel(
        new RAPIER.Vector3(currentVel.x * 0.8, currentVel.y, currentVel.z),
        true
      );
    }
  }

  update() {
    if (this.rigidbody) {
      const translation = this.rigidbody.translation();
      const rotation = this.rigidbody.rotation();

      this.mesh.position.set(translation.x, translation.y, translation.z);
      this.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

      this.checkGrounded();
      this.handleMovement();
    }
    if (this.camera) {
      this.camera.position.lerp(
        new Vector3(
          this.mesh.position.x,
          this.mesh.position.y + 2,
          this.camera.position.z
        ),
        0.1
      );
    }
  }

  applyForce(x, y, z) {
    if (this.rigidbody && this.isDynamic) {
      this.rigidbody.applyImpulse(new RAPIER.Vector3(x, y, z), true);
    }
  }

  setVelocity(x, y, z) {
    if (this.rigidbody && this.isDynamic) {
      this.rigidbody.setLinvel(new RAPIER.Vector3(x, y, z), true);
    }
  }

  destroy() {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    if (this.mesh) this.scene.remove(this.mesh);
    if (this.rigidbody && this.physicsWorld?.getWorld()) {
      this.physicsWorld.getWorld().removeRigidBody(this.rigidbody);
    }
    if (this.debugFolder) this.debug.ui.removeFolder(this.debugFolder);
  }
}
