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

    this.bloodParts = [];

    window.addEventListener("click", () => {
      this.createBloodParticle(5, 200, new THREE.Color(0xff0000));
    });

    this.timeSinceLastCreation = 0;
    this.creationInterval = 1.0;
  }

  createBloodParticle(count, size, color) {
    const positionArray = new Float32Array(count * 3);
    const sizeArray = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positionArray[i3 + 0] = (Math.random() - 0.5) * 0.1;
      positionArray[i3 + 1] = 0.38;
      positionArray[i3 + 2] = (Math.random() - 0.5) * 0.1;

      sizeArray[i] = Math.random() * 1 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positionArray, 3)
    );
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizeArray, 1));

    const materialShader = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: size },
        uResolution: {
          value: new THREE.Vector2(this.sizes.width, this.sizes.height),
        },
        uTexture: { value: this.texture },
        uColor: { value: color },
        uProgress: { value: 0 },
      },
    });

    const bloodPart = new THREE.Points(geometry, materialShader);
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

    console.log("Disposing blood particle");

    bloodPart.geometry.dispose();
    bloodPart.material.dispose();
    this.scene.remove(bloodPart);

    this.bloodParts = this.bloodParts.filter((b) => b !== bloodPart);
  }

  update() {
    if (this.character && this.bloodParts.length > 0) {
      const charPos = this.character.model.position;

      this.bloodParts.forEach((bloodPart) => {
        bloodPart.position.copy(charPos);
        // bloodPart.material.uniforms.uTime.value += deltaTime * 0.5;
      });
    }

    this.timeSinceLastCreation += performance.now() / 1000;
    // console.log(this.creationInterval);

    if (this.timeSinceLastCreation >= this.creationInterval) {
      this.createBloodParticle(5, 200, new THREE.Color(0xff0000));
      this.timeSinceLastCreation = 0;
    }
  }
}
