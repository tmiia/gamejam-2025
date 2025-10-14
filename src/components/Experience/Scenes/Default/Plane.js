import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import Experience from "../../Experience.js";

export default class Plane {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.sceneManager.currentScene.scene;
    this.physicsWorld = this.experience.physicsWorld;

    this.rigidbody = null;
    this.collider = null;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setPhysics();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(10, 10);
  }

  setMaterial() {
    this.material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = -3;
    this.scene.add(this.mesh);
  }

  setPhysics() {
    if (!this.physicsWorld || !this.physicsWorld.getWorld()) {
      console.warn("PhysicsWorld n'est pas initialisé");
      return;
    }

    const hx = 5;
    const hz = 5;
    const hy = 0.1;

    const bodyDesc = RAPIER.RigidBodyDesc.fixed();
    bodyDesc.setTranslation(
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z
    );

    this.rigidbody = this.physicsWorld.getWorld().createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(hx, hy, hz);

    colliderDesc.setFriction(0.7);
    colliderDesc.setRestitution();

    this.collider = this.physicsWorld
      .getWorld()
      .createCollider(colliderDesc, this.rigidbody);
  }

  update() {}

  destroy() {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    if (this.mesh) this.scene.remove(this.mesh);
    if (this.rigidbody && this.physicsWorld?.getWorld()) {
      this.physicsWorld.getWorld().removeRigidBody(this.rigidbody);
    }
  }
}
