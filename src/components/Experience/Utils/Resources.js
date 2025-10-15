import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { FBXLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three/webgpu";
import EventEmitter from "./EventEmitter";

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    // Options
    this.sources = sources;

    // Setup
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoaders();
    this.load();
  }

  setLoaders() {
    this.loaders = {};
    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.FBXLoader = new FBXLoader();
    this.loaders.textureLoader = new THREE.TextureLoader();
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
  }

  load() {
    for (const source of this.sources) {
      if (source.type === "gltf") {
        this.loaders.gltfLoader.load(source.path, (gltf) => {
          this.sourceLoaded(source, gltf);
        });
      } else if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path, (texture) => {
          this.sourceLoaded(source, texture);
        });
      } else if (source.type === "cubeTexture") {
        this.loaders.cubeTextureLoader.load(source.path, (cubeTexture) => {
          this.sourceLoaded(source, cubeTexture);
        });
      } else if (source.type === "fbx") {
        this.loaders.FBXLoader.load(source.path, (fbx) => {
          this.sourceLoaded(source, fbx);
        });
      }
    }
  }
  sourceLoaded(source, file) {
    this.items[source.name] = file;
    this.loaded++;
    if (this.loaded === this.toLoad) {
      this.trigger("loaded");
    }
  }
}
