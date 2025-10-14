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

    this.position = position;
    this.isDynamic = isDynamic;

    this.rigidbody = null;
    this.collider = null;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setPhysics();
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

    this.rigidbody.setLinearDamping(0.1);
    this.rigidbody.setAngularDamping(0.1);
  }

  update() {
    if (this.rigidbody) {
      const translation = this.rigidbody.translation();
      const rotation = this.rigidbody.rotation();

      this.mesh.position.set(translation.x, translation.y, translation.z);
      this.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
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
