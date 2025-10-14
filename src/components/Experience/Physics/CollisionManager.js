import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import Experience from "../Experience.js";

export default class CollisionManager {
  constructor() {
    this.experience = new Experience();
  }

  createColliderFromMesh(mesh) {
    if (!this.physicsWorld?.getWorld()) return;

    const world = this.physicsWorld.getWorld();

    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox;
    const size = new THREE.Vector3();
    box.getSize(size);

    const position = new THREE.Vector3();
    mesh.getWorldPosition(position);

    const rotation = new THREE.Quaternion();
    mesh.getWorldQuaternion(rotation);

    const bodyDesc = RAPIER.RigidBodyDesc.fixed()
      .setTranslation(position.x, position.y, position.z)
      .setRotation({
        x: rotation.x,
        y: rotation.y,
        z: rotation.z,
        w: rotation.w,
      });

    const body = world.createRigidBody(bodyDesc);

    const hx = size.x / 2;
    const hy = size.y / 2;
    const hz = size.z / 2;
    const colliderDesc = RAPIER.ColliderDesc.cuboid(hx, hy, hz);

    world.createCollider(colliderDesc, body);
  }
}
