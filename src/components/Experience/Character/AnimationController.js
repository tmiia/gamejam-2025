import * as THREE from "three";

/**
 * AnimationController - L'acteur
 * 
 * Responsabilités :
 * ✅ Gère le THREE.AnimationMixer
 * ✅ Charge toutes les animations du modèle
 * ✅ Joue les animations selon les événements
 * ✅ Fait les transitions fluides (fadeIn/fadeOut)
 * ✅ Update le mixer chaque frame
 * 
 * ❌ Ne prend PAS de décisions
 * ❌ Ne touche PAS à la physique
 * ❌ N'écoute PAS les inputs directement
 */
export default class AnimationController {
  constructor(character) {
    this.character = character;
    this.model = character.model;
    this.resources = character.resources;

    this.mixer = null;
    this.animations = {};
    this.currentAction = null;
    this.previousAnimation = null;

    this.init();
    this.setupEventListeners();
  }

  init() {
    if (!this.model) {
      console.warn("AnimationController: No model provided");
      return;
    }

    // Créer le mixer
    this.mixer = new THREE.AnimationMixer(this.model);

    // Charger l'animation 'run'
    const fastRunAnim = this.resources.items.fastRunAnim;
    if (fastRunAnim && fastRunAnim.animations && fastRunAnim.animations.length > 0) {
      this.animations.run = this.mixer.clipAction(fastRunAnim.animations[0]);
    }

    // Pour l'instant, on n'a que l'animation 'run'
    // Plus tard, on ajoutera: idle, walk, jump, etc.
  }

  setupEventListeners() {
    // Écoute les événements du CharacterController
    if (this.character.characterController) {
      this.character.characterController.on("startMoving", () => {
        this.playAnimation("run");
      });

      this.character.characterController.on("stopMoving", () => {
        this.stopAnimation("run");
      });
    }
  }

  /**
   * Joue une animation avec transition fluide
   * @param {string} name - Nom de l'animation ('run', 'idle', etc.)
   * @param {object} options - Options de transition
   */
  playAnimation(name, options = {}) {
    const {
      fadeInDuration = 0.2,
      loop = THREE.LoopRepeat,
      timeScale = 1.0
    } = options;

    const action = this.animations[name];

    if (!action) {
      console.warn(`AnimationController: Animation '${name}' not found`);
      return;
    }

    // Si c'est déjà l'animation en cours, ne rien faire
    if (this.currentAction === action && action.isRunning()) {
      return;
    }

    // Fade out de l'animation précédente
    if (this.currentAction && this.currentAction !== action) {
      this.currentAction.fadeOut(fadeInDuration);
    }

    // Configure et démarre la nouvelle animation
    action.reset();
    action.setLoop(loop);
    action.timeScale = timeScale;
    action.fadeIn(fadeInDuration);
    action.play();

    this.previousAnimation = this.currentAction;
    this.currentAction = action;
  }

  /**
   * Arrête une animation avec fade out
   * @param {string} name - Nom de l'animation à arrêter
   * @param {number} fadeOutDuration - Durée du fade out
   */
  stopAnimation(name, fadeOutDuration = 0.2) {
    const action = this.animations[name];

    if (!action) {
      console.warn(`AnimationController: Animation '${name}' not found`);
      return;
    }

    if (action.isRunning()) {
      action.fadeOut(fadeOutDuration);
      setTimeout(() => {
        action.stop();
      }, fadeOutDuration * 1000);
    }

    if (this.currentAction === action) {
      this.currentAction = null;
    }
  }

  /**
   * Retourne le nom de l'animation en cours
   * @returns {string|null}
   */
  getCurrentAnimation() {
    if (!this.currentAction) return null;

    // Cherche le nom de l'animation en cours
    for (const [name, action] of Object.entries(this.animations)) {
      if (action === this.currentAction) {
        return name;
      }
    }

    return null;
  }

  /**
   * Met à jour le mixer (appelé chaque frame)
   * @param {number} delta - Temps écoulé depuis la dernière frame (en secondes)
   */
  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  /**
   * Nettoie les ressources
   */
  destroy() {
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.model);
    }

    this.animations = {};
    this.currentAction = null;
    this.previousAnimation = null;
  }
}

