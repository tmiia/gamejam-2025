import gsap from "gsap";
import * as THREE from "three";
import Experience from "../../../../Experience.js";
import fragmentShader from "./fragmentShader.glsl";
import vertexShader from "./vertexShader.glsl";

export default class BloodParticles {
  constructor() {
    this.experience = new Experience();
    this.character = this.experience.sceneManager.currentScene.character;
    this.scene = this.experience.sceneManager.currentScene.scene;
    this.sizes = this.experience.sizes;
    this.texture = this.experience.resources.items.bloodTexture;
    this.characterControllerIsMoving =
      this.experience.sceneManager.currentScene.character.characterController._isMoving;

    this.bloodParts = [];
    this.direction = 0;
    this.quantity = 1;

    this.timeSinceLastCreation = 0;
    this.creationInterval = 1000.0;

    this.head = null;
    this.character.model.traverse((child) => {
      if (child.isBone && child.name === "mixamorig9Head") {
        this.head = child;
      }
    });
  }

  createBloodParticle(count, size, color) {
    const positionArray = new Float32Array(count * 3);
    const sizeArray = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positionArray[i3 + 0] = (Math.random() - 0.5) * 0.025;
      positionArray[i3 + 1] = 0;
      positionArray[i3 + 2] = 0;
      sizeArray[i] = Math.random() * 1 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positionArray, 3)
    );
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizeArray, 1));

    const directionX = (Math.random() - 0.5) * 1 + this.direction;
    const directionY = Math.random() * 1 + 1;

    const materialShader = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: size },
        uResolution: {
          value: new THREE.Vector2(this.sizes.width, this.sizes.height),
        },
        uTexture: { value: this.texture },
        uColor: { value: color },
        uProgress: { value: 0 },
        uDirection: { value: new THREE.Vector2(directionX, directionY) },
      },
    });

    const bloodPart = new THREE.Points(geometry, materialShader);
    bloodPart.renderOrder = 999;

    this.scene.add(bloodPart);
    this.bloodParts.push(bloodPart);

    gsap.to(materialShader.uniforms.uProgress, {
      value: 1,
      duration: 1,
      onComplete: () => {
        this.dispose(bloodPart);
      },
    });
  }

  dispose(bloodPart) {
    if (!bloodPart) return;
    bloodPart.geometry.dispose();
    bloodPart.material.dispose();
    this.scene.remove(bloodPart);
    this.bloodParts = this.bloodParts.filter((b) => b !== bloodPart);
  }

  update() {
    const velocity = this.character.rigidbody.linvel().x;

    const targetDirection = this.experience.sceneManager.currentScene.character
      .characterController._isMoving
      ? velocity * -1.5
      : 0;

    const smoothingFactor = 0.07;
    this.direction = THREE.MathUtils.lerp(
      this.direction,
      targetDirection,
      smoothingFactor
    );

    if (this.head && this.bloodParts.length > 0) {
      const charPos = this.head.getWorldPosition(new THREE.Vector3());
      this.bloodParts.forEach((bloodPart) => {
        bloodPart.position.copy(charPos);
      });
    }

    this.timeSinceLastCreation += performance.now() / 1000;
    if (this.timeSinceLastCreation >= this.creationInterval) {
      this.createBloodParticle(this.quantity, 300, new THREE.Color(0xff0000));
      this.timeSinceLastCreation = 0;
    }
  }
}
