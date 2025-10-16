import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import Experience from "../Experience.js";

export default class CollisionManager {
  constructor() {
    this.experience = new Experience();
    this.physicsWorld = this.experience.physicsWorld;
  }

  createColliderFromMesh(mesh) {
    if (!this.physicsWorld?.getWorld()) {
      console.warn("PhysicsWorld n'est pas initialisé");
      return null;
    }

    const world = this.physicsWorld.getWorld();

    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox;
    const localSize = new THREE.Vector3();
    box.getSize(localSize);
    console.log(box.getSize(localSize));

    const worldSize = localSize.clone().multiply(mesh.scale);

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

    const hx = worldSize.x / 2;
    const hy = worldSize.y / 2;
    const hz = worldSize.z / 2;
    const colliderDesc = RAPIER.ColliderDesc.cuboid(hx, hy, hz);
    colliderDesc.setFriction(0.7);

    world.createCollider(colliderDesc, body);

    console.log(
      `Collider créé - Size: (${hx.toFixed(2)}, ${hy.toFixed(2)}, ${hz.toFixed(
        2
      )})`
    );

    return body;
  }

  createColliderFromModel(model) {
    const bodies = [];

    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        console.log("Création de collider pour le mesh:", child.name);

        const body = this.createColliderFromMesh(child);
        if (body) bodies.push(body);
      }
    });

    return bodies;
  }
}
