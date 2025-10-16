import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";
import Experience from "../Experience.js";

export default class PostProcessingClass {
  constructor() {
    this.experience = new Experience();
    this.renderer = this.experience.renderer.instance;
    this.camera = this.experience.camera.instance;
    this.scene = this.experience.sceneManager.currentScene.scene;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new EffectPass(this.camera, new BloomEffect()));
  }
  update() {
    this.composer.render();
  }
}
