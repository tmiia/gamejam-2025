import RAPIER from "@dimforge/rapier3d-compat";
import EventEmitter from "../Utils/EventEmitter.js";

export default class PhysicsWorld extends EventEmitter {
  constructor() {
    super();
    this.world = null;
    this.ready = false;
    this.init();
  }

  async init() {
    await RAPIER.init();

    const gravity = new RAPIER.Vector3(0, -5, 0);
    this.world = new RAPIER.World(gravity);

    this.world.maxVelocity = 100;
    this.world.maxAngularVelocity = 50;

    this.ready = true;
    this.trigger("ready");
  }

  addRigidBody(shape, position = { x: 0, y: 0, z: 0 }, isDynamic = true) {
    if (!this.world) return null;

    const bodyDesc = isDynamic
      ? RAPIER.RigidBodyDesc.dynamic()
      : RAPIER.RigidBodyDesc.fixed();

    bodyDesc.setTranslation(position.x, position.y, position.z);

    const body = this.world.createRigidBody(bodyDesc);
    this.world.createCollider(shape, body);

    return body;
  }

  addSphere(radius, position, isDynamic = true) {
    const shape = RAPIER.ColliderDesc.ball(radius);
    return this.addRigidBody(shape, position, isDynamic);
  }

  addCube(hx, hy, hz, position, isDynamic = true) {
    const shape = RAPIER.ColliderDesc.cuboid(hx, hy, hz);
    return this.addRigidBody(shape, position, isDynamic);
  }

  castRay(ray, maxToi, solid = true) {
    if (!this.world) return null;
    return this.world.castRay(ray, maxToi, solid);
  }

  getWorld() {
    return this.world;
  }

  update(delta) {
    if (this.world) {
      // Use actual delta time but clamp it to avoid physics instability
      // Delta is in milliseconds, convert to seconds and clamp between 1/120 and 1/30
      const deltaSeconds = Math.min(Math.max(delta / 1000, 1 / 120), 1 / 30);
      this.world.timestep = deltaSeconds;
      this.world.step();
    }
  }
}
