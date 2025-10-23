import { Howl, Howler } from "howler";
import EventEmitter from "../Utils/EventEmitter.js";

export default class AudioManager extends EventEmitter {
  constructor() {
    super();

    this.sounds = {};
    this.currentWalkSound = null;
    this.isWalkSoundPlaying = false;
    this.filters = {};

    this.progressiveMuffle = {
      enabled: false,
      soundName: null,
      startTime: null,
      duration: null,
      startFrequency: 20000,
      targetFrequency: 300,
      currentFrequency: 20000
    };

    this.initializeSounds();
  }

  initializeSounds() {    
    this.sounds.ambiance = new Howl({
      src: ["/audio/background.mp3"],
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

    this.sounds.jump = new Howl({
      src: ["/audio/jump.mp3"],
      loop: false,
      volume: 0.05,
    });

    this.sounds.landing = new Howl({
      src: ["/audio/landing.mp3"],
      loop: false,
      volume: 0.2,
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

  muteSound(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].mute(true);
    }
  }

  unmuteSound(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].mute(false);
    }
  }

  playJump() {
    if (this.sounds.jump) {
      this.sounds.jump.play();
    }
  }

  playLanding() {
    if (this.sounds.landing) {
      this.sounds.landing.play();
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

  setJumpVolume(volume) {
    if (this.sounds.jump) {
      this.sounds.jump.volume(volume);
    }
  }

  setLandingVolume(volume) {
    if (this.sounds.landing) {
      this.sounds.landing.volume(volume);
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

  async applyMuffledEffect(soundName, targetFrequency) {
    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn(`Sound "${soundName}" not found`);
      return;
    }
  
    if (!this.filters[soundName]) {
      try {
        const howlerCtx = Howler.ctx;
        
        const filter = howlerCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 20000;
        filter.Q.value = 1;
  
        const masterGain = Howler.masterGain;
        
        if (masterGain) {
          try {
            masterGain.disconnect();
          } catch (e) {
            console.warn("Could not disconnect master gain:", e);
          }
          
          masterGain.connect(filter);
          filter.connect(howlerCtx.destination);
        }
  
        this.filters[soundName] = filter;
      } catch (error) {
        console.error("Error creating filter:", error);
        return;
      }
    }
  
    this.filters[soundName].frequency.value = targetFrequency;
  }

  removeMuffledEffect(soundName) {
    const filter = this.filters[soundName];
    if (!filter) {
      console.warn(`No filter found for sound "${soundName}"`);
      return;
    }
  
    filter.frequency.value = 20000;
  }

  startProgressiveMuffle(duration = 3000, targetFrequency = 100) {
    if (!this.globalFilter) {
      const filter = Howler.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 20000;
      filter.Q.value = 1;
  
      Howler.masterGain.disconnect();
      Howler.masterGain.connect(filter);
      filter.connect(Howler.ctx.destination);
  
      this.globalFilter = filter;
    }
  
    this.progressiveMuffle = {
      enabled: true,
      startTime: Date.now(),
      duration: duration,
      startFrequency: 20000,
      targetFrequency: targetFrequency
    };
  
    console.log(`Started progressive muffle over ${duration}ms to ${targetFrequency}Hz`);
  }

  update() {
    if (!this.progressiveMuffle.enabled) return;
  
    const { startTime, duration, startFrequency, targetFrequency } = this.progressiveMuffle;
    
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1.0);
    
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    const currentFrequency = startFrequency - (startFrequency - targetFrequency) * eased;
    
    if (this.globalFilter) {
      this.globalFilter.frequency.value = currentFrequency;
    }
  
    if (progress >= 1.0) {
      this.progressiveMuffle.enabled = false;
      console.log(`Progressive muffle complete at ${targetFrequency}Hz`);
    }
  }

  destroy() {
    Object.values(this.filters).forEach((filter) => {
      try {
        filter.disconnect();
      } catch (e) {
        console.warn("Error disconnecting filter:", e);
      }
    });

    Object.values(this.sounds).forEach((sound) => {
      sound.stop();
      sound.unload();
    });
    
    this.sounds = {};
    this.filters = {};
  }
}

