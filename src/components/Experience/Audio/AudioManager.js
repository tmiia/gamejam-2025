import { Howl, Howler } from "howler";
import EventEmitter from "../Utils/EventEmitter.js";

export default class AudioManager extends EventEmitter {
  constructor() {
    super();

    this.sounds = {};
    this.currentWalkSound = null;
    this.isWalkSoundPlaying = false;
    this.filters = {};
    this.soundFilters = {}; 

    this.progressiveMuffle = {
      enabled: false,
      soundName: 'ambiance',
      startTime: null,
      duration: null,
      startFrequency: 20000,
      targetFrequency: 300,
      currentFrequency: 20000
    };

    this.tickingAcceleration = {
      enabled: false,
      startTime: null,
      startRate: 1.0,
      maxRate: 3.0,
      duration: 10000,
      isPlaying: false
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
      volume: 0.08,
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

    this.sounds.ticking = new Howl({
      src: ["/audio/ticking.mp3"],
      loop: true,
      volume: 0.3,
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

  createIndividualSoundFilter(soundName) {
    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn(`Sound "${soundName}" not found`);
      return null;
    }

    if (this.soundFilters[soundName]) {
      return this.soundFilters[soundName];
    }

    try {
      const howlerCtx = Howler.ctx;
      
      const filter = howlerCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 20000;
      filter.Q.value = 1;

      this.soundFilters[soundName] = filter;

      sound.once('play', () => {
        const soundNode = sound._sounds[0]?._node;
        if (soundNode) {
          try {
            soundNode.disconnect();
            soundNode.connect(filter);
            filter.connect(howlerCtx.destination);
          } catch (e) {
            console.warn(`Could not apply filter to ${soundName}:`, e);
          }
        }
      });

      if (sound.playing()) {
        const soundNode = sound._sounds[0]?._node;
        if (soundNode) {
          try {
            soundNode.disconnect();
            soundNode.connect(filter);
            filter.connect(howlerCtx.destination);
          } catch (e) {
            console.warn(`Could not apply filter to ${soundName}:`, e);
          }
        }
      }

      return filter;
    } catch (error) {
      console.error(`Error creating filter for ${soundName}:`, error);
      return null;
    }
  }

  async applyMuffledEffect(soundName, targetFrequency) {
    const filter = this.createIndividualSoundFilter(soundName);
    if (!filter) {
      return;
    }
  
    filter.frequency.value = targetFrequency;
  }

  removeMuffledEffect(soundName) {
    const filter = this.soundFilters[soundName];
    if (!filter) {
      console.warn(`No filter found for sound "${soundName}"`);
      return;
    }
  
    filter.frequency.value = 20000;
  }

  startProgressiveMuffle(duration = 900, targetFrequency = 100, soundName = 'ambiance') {
    const filter = this.createIndividualSoundFilter(soundName);
    if (!filter) {
      console.warn(`Could not create filter for ${soundName}`);
      return;
    }

    this.progressiveMuffle = {
      enabled: true,
      soundName: soundName,
      startTime: Date.now(),
      duration: duration,
      startFrequency: 20000,
      targetFrequency: targetFrequency
    };
  }

  setMuffleFrequency(frequency, soundName = 'ambiance') {
    const filter = this.createIndividualSoundFilter(soundName);
    if (!filter) {
      console.warn(`Could not create filter for ${soundName}`);
      return;
    }

    const clampedFrequency = Math.max(100, Math.min(20000, frequency));
    filter.frequency.value = clampedFrequency;
    this.progressiveMuffle.currentFrequency = clampedFrequency;
  }

  startTickingSound() {
    if (!this.tickingAcceleration.isPlaying && this.sounds.ticking) {
      this.sounds.ticking.rate(this.tickingAcceleration.startRate);
      this.sounds.ticking.play();
      this.tickingAcceleration.isPlaying = true;
      this.tickingAcceleration.enabled = true;
      this.tickingAcceleration.startTime = Date.now();
      console.log('Started ticking sound with progressive acceleration');
    }
  }

  stopTickingSound() {
    if (this.tickingAcceleration.isPlaying && this.sounds.ticking) {
      this.sounds.ticking.stop();
      this.tickingAcceleration.isPlaying = false;
      this.tickingAcceleration.enabled = false;
      this.tickingAcceleration.startTime = null;
      console.log('Stopped ticking sound');
    }
  }

  stopAll() {
    Object.values(this.sounds).forEach((sound) => {
      sound.stop();
    });
    this.isWalkSoundPlaying = false;
    this.currentWalkSound = null;
    this.tickingAcceleration.isPlaying = false;
    this.tickingAcceleration.enabled = false;
    this.tickingAcceleration.startTime = null;
    console.log('Stopped all sounds');
  }

  update() {
    if (this.progressiveMuffle.enabled) {
      const { startTime, duration, startFrequency, targetFrequency, soundName } = this.progressiveMuffle;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const currentFrequency = startFrequency - (startFrequency - targetFrequency) * eased;
      
      const filter = this.soundFilters[soundName];
      if (filter) {
        filter.frequency.value = currentFrequency;
      }
    
      if (progress >= 1.0) {
        this.progressiveMuffle.enabled = false;
        console.log(`Progressive muffle complete on ${soundName} at ${targetFrequency}Hz`);
      }
    }

    if (this.tickingAcceleration.enabled && this.tickingAcceleration.isPlaying) {
      const { startTime, duration, startRate, maxRate } = this.tickingAcceleration;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      const eased = Math.pow(progress, 2);
      
      const currentRate = startRate + (maxRate - startRate) * eased;
      
      if (this.sounds.ticking) {
        this.sounds.ticking.rate(currentRate);
      }
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

    Object.values(this.soundFilters).forEach((filter) => {
      try {
        filter.disconnect();
      } catch (e) {
        console.warn("Error disconnecting sound filter:", e);
      }
    });

    Object.values(this.sounds).forEach((sound) => {
      sound.stop();
      sound.unload();
    });
    
    this.sounds = {};
    this.filters = {};
    this.soundFilters = {};
  }
}

