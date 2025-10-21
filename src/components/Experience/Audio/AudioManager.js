import { Howl } from "howler";
import EventEmitter from "../Utils/EventEmitter.js";

export default class AudioManager extends EventEmitter {
  constructor() {
    super();

    this.sounds = {};
    this.currentWalkSound = null;
    this.isWalkSoundPlaying = false;

    this.initializeSounds();
  }

  initializeSounds() {
    this.sounds.ambiance = new Howl({
      src: ["/audio/ambiance.mp3"],
      loop: true,
      volume: 0.4,
      autoplay: true,
    });

    this.sounds.walk = new Howl({
      src: ["/audio/walk.mp3"],
      loop: true,
      volume: 0.15,
      rate: 1.0,
    });
  }

  playAmbiance() {
    if (this.sounds.ambiance) {
      this.sounds.ambiance.play();
    }
  }

  stopAmbiance() {
    if (this.sounds.ambiance) {
      this.sounds.ambiance.stop();
    }
  }

  startWalkSound() {
    if (!this.isWalkSoundPlaying && this.sounds.walk) {
      this.sounds.walk.rate(1.0);
      this.currentWalkSound = this.sounds.walk.play();
      this.isWalkSoundPlaying = true;
    }
  }

  startRunSound() {
    if (this.sounds.walk) {
      if (this.isWalkSoundPlaying) {
        this.sounds.walk.rate(1.5);
      } else {
        this.sounds.walk.rate(1.5);
        this.currentWalkSound = this.sounds.walk.play();
        this.isWalkSoundPlaying = true;
      }
    }
  }

  stopWalkSound() {
    if (this.isWalkSoundPlaying && this.sounds.walk) {
      this.sounds.walk.stop();
      this.isWalkSoundPlaying = false;
      this.currentWalkSound = null;
    }
  }

  setAmbianceVolume(volume) {
    if (this.sounds.ambiance) {
      this.sounds.ambiance.volume(volume);
    }
  }

  setWalkVolume(volume) {
    if (this.sounds.walk) {
      this.sounds.walk.volume(volume);
    }
  }

  muteAll() {
    Object.values(this.sounds).forEach((sound) => {
      sound.mute(true);
    });
  }

  unmuteAll() {
    Object.values(this.sounds).forEach((sound) => {
      sound.mute(false);
    });
  }

  destroy() {
    Object.values(this.sounds).forEach((sound) => {
      sound.stop();
      sound.unload();
    });
    this.sounds = {};
  }
}

