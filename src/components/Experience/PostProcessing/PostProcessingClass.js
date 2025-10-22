// BloodVignetteEffect.js
import {
  BloomEffect,
  Effect,
  EffectComposer,
  EffectPass,
  GlitchEffect,
  RenderPass,
  VignetteEffect,
} from "postprocessing";
import { Uniform, Vector2 } from "three";
import Experience from "../Experience.js";

const fragmentShader = `
uniform float intensity;
uniform float spread;
uniform vec3 bloodColor;

// Simple noise function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(uv, center);
  
  // Create base vignette mask
  float baseVignette = smoothstep(spread, spread * 1.8, dist);
  
  // Generate static noise for the vignette area
  float noiseAmount = 0.05;
  float noiseValue = noise(uv * 20.0);
  float noiseValue2 = noise(uv * 12.0);
  // float noiseValue = noise(uv * 8.0);
  // float noiseValue2 = noise(uv * 12.0);
  
  // Apply noise only where vignette is visible
  float noiseMask = (noiseValue * 2.0 - 1.0) * noiseAmount * baseVignette;
  noiseMask += (noiseValue2 * 2.0 - 1.0) * noiseAmount * 0.3 * baseVignette;
  
  float vignette = baseVignette + noiseMask;
  vignette = clamp(vignette, 0.0, 1.0);
  
  // Apply intensity
  vignette = pow(vignette, 2.0) * intensity;
  
  // Add static grain only to blood effect
  float grain = noise(uv * 200.0) * 0.05 * baseVignette;
  // vignette += grain * intensity;
  
  // Mix blood color
  vec3 bloodTint = mix(inputColor.rgb, bloodColor, vignette);
  
  // Darken edges
  float darkness = 1.0 - vignette * 0.6;
  bloodTint *= darkness;
  
  outputColor = vec4(bloodTint, inputColor.a);
}
`;

export class BloodVignetteEffect extends Effect {
  constructor({
    intensity = 0.0,
    spread = 0.3,
    bloodColor = [0.8, 0.0, 0.0],
  } = {}) {
    super("BloodVignetteEffect", fragmentShader, {
      uniforms: new Map([
        ["intensity", new Uniform(intensity)],
        ["spread", new Uniform(spread)],
        ["bloodColor", new Uniform(bloodColor)],
        ["time", new Uniform(0)],
      ]),
    });

    this.targetIntensity = intensity;
    this.currentIntensity = intensity;
    this.lerpSpeed = 3.0; // Vitesse de transition
  }

  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get("time").value += deltaTime;

    // Smooth lerp vers la target intensity
    this.currentIntensity +=
      (this.targetIntensity - this.currentIntensity) *
      this.lerpSpeed *
      deltaTime;
    this.uniforms.get("intensity").value = this.currentIntensity;
  }

  setIntensity(value) {
    this.targetIntensity = value;
  }

  getIntensity() {
    return this.currentIntensity;
  }

  setSpread(value) {
    this.uniforms.get("spread").value = value;
  }

  setBloodColor(r, g, b) {
    this.uniforms.get("bloodColor").value = [r, g, b];
  }
}

export default class PostProcessingClass {
  constructor() {
    this.experience = new Experience();
    this.renderer = this.experience.renderer.instance;
    this.camera = this.experience.camera.instance;
    this.scene = this.experience.sceneManager.currentScene.scene;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const bloomEffect = new BloomEffect({
      intensity: 0.7,
      luminanceThreshold: 0.2,
      luminanceSmoothing: 0.075,
    });
    this.composer.addPass(new EffectPass(this.camera, bloomEffect));

    const vignetteEffect = new VignetteEffect({
      eskil: false,
      offset: 0.6,
      darkness: 0.45,
    });
    this.composer.addPass(new EffectPass(this.camera, vignetteEffect));

    this.glitchEffect = new GlitchEffect({
      delay: new Vector2(1.0, 2.0),
      duration: new Vector2(0.4, 0.6),
      strength: new Vector2(0.3, 0.6),
    });

    // this.composer.addPass(new EffectPass(this.camera, this.glitchEffect));

    this.bloodVignetteEffect = new BloodVignetteEffect({
      intensity: 0.5,
      spread: 0.45,
      bloodColor: [0, 0.0, 0.0],
    });
    this.composer.addPass(
      new EffectPass(this.camera, this.bloodVignetteEffect)
    );

    this.bloodIntensity = 0.99;
    this.spread = 0.35;
  }

  update() {
    this.composer.render();
  }

  set bloodIntensity(value) {
    this._bloodIntensity = value;
    this.bloodVignetteEffect.setIntensity(value);
  }

  set spread(value) {
    this._spread = value;
    this.bloodVignetteEffect.setSpread(value);
  }

  get bloodIntensity() {
    return this._bloodIntensity;
  }

  flashDamage(intensity = 0.7, fadeSpeed = 2.0) {
    this.bloodVignetteEffect.setIntensity(intensity);
    this.bloodVignetteEffect.lerpSpeed = fadeSpeed;
    setTimeout(() => {
      this.bloodVignetteEffect.setIntensity(this._bloodIntensity || 0);
    }, 100);
  }
}
