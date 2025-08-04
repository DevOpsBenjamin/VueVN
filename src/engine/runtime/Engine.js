// Import generated event index (adjust path as needed)
import {
  EngineEvents,
  EngineAPI,
  EngineSave,
  VNInterruptError,
} from '@/generate/runtime';
import html2canvas from 'html2canvas';
import { engineStateEnum as ENGINE_STATES } from '@/generate/stores';
/**
 * @typedef {Object} Engine
 * @property {function(string): Promise<void>} showText
 * @property {function(string): Promise<void>} showDialogueText
 * @property {function(string): Promise<void>} showImage
 * @property {function(Array<{text: string, id: string}>): Promise<string>} showChoices
 * @property {function(string, any): void} setVar
 * @property {function(string): void} setBackground
 * @property {object} state // Pinia state (reactive)
 */

class Engine {
  // #region Engine API for events and UI
  setBackground(imagePath) {
    EngineAPI.setBackground(this, imagePath);
  }
  setForeground(imagePath) {
    EngineAPI.setForeground(this, imagePath);
  }
  async showText(text, from = 'engine') {
    await EngineAPI.showText(this, text, from);
  }
  // #endregion

  // #region SAVE engine
  startNewGame() {
    EngineSave.startNewGame(this);
  }
  loadGame(slot) {
    return EngineSave.loadGame(this, slot);
  }
  saveGame(slot) {
    console.log(`ENGINE CALL: Saving game to slot ${slot}`);
    EngineSave.saveGame(this, slot);
  }
  // #endregion

  // #region internal engine core

  /**
   * Get the singleton engine instance from window, or undefined if not set
   */
  static getInstance() {
    return typeof window !== 'undefined' ? window.__VN_ENGINE__ : undefined;
  }

  /**
   * Create a new engine instance
   * @param {object} gameState - Pinia store for game state
   * @param {object} engineState - Pinia store for engine state
   */
  constructor(gameState, engineState) {
    this.gameState = gameState;
    this.engineState = engineState;
    this.awaiterResult = null;
    this.lastScreenshot = null;
    // Expose for debug/cheat
    if (typeof window !== 'undefined') {
      if (!window.__VN_ENGINE__) {
        console.debug('Initializing VN Engine instance');
        window.VueVN = this.gameState;
        window.__VN_ENGINE__ = this;
        this.initVNInputHandlers();
      }
    }
    //REPLAY VAR
    this.replayMode = false;
    this.targetStep = 0;
  }

  async captureGameScreenshot() {
    const gameEl = document.getElementById('game-root'); // or your main VN container
    if (!gameEl) return null;
    const canvas = await html2canvas(gameEl);
    return canvas.toDataURL('image/png');
  }

  initVNInputHandlers() {
    window.addEventListener('keydown', async (e) => {
      if (e.key === 'Escape') {
        if (
          this.engineState.initialized &&
          this.engineState.state === ENGINE_STATES.MENU
        ) {
          this.engineState.state = ENGINE_STATES.RUNNING;
        } else {
          this.lastScreenshot = await this.captureGameScreenshot();
          this.engineState.state = ENGINE_STATES.MENU;
        }
        // Do not resolve
      } else if (e.key === 'Space' || e.key === 'ArrowRight') {
        this.resolveAwaiter('continue');
      } else {
        // Optionally: handle other keys (e.g., left arrow for back)
        console.debug(`Unhandled key: ${e.key}`);
      }
    });
    window.addEventListener('click', (e) => {
      if (e.clientX > window.innerWidth / 2) {
        if (this.engineState.state === ENGINE_STATES.RUNNING) {
          this.resolveAwaiter('continue');
        } else {
          console.debug('Click ignored, not in RUNNING state');
        }
      } else {
        // Optionally: this.resolveAwaiter('back');
      }
    });
  }

  // resolve awaiter from anywhere in the engine
  resolveAwaiter(result) {
    if (this.awaiterResult) {
      console.debug('Resolving awaiter with result:', result);
      this.awaiterResult(result);
      this.cleanAwaiter();
    } else {
      console.debug('No awaiter to resolve');
    }
  }

  // cancel awaiter from anywhere in the engine
  cancelAwaiter() {
    if (this.awaiterResult) {
      console.debug('Cancelling awaiter');
      this.awaiterResult(Promise.reject(new VNInterruptError()));
      this.cleanAwaiter();
    } else {
      console.debug('No awaiter to cancel');
    }
  }

  // cancel awaiter from anywhere in the engine
  cleanAwaiter() {
    this.awaiterResult = null;
    this.engineState.dialogue = null; // Clear dialogue after resolving
    this.engineState.choices = null; // Clear choices
  }

  async run() {
    // INFINITE LOOP: Run the game loop until interrupted
    console.log('Starting Engine...');
    while (true) {
      try {
        // Run the main game loop
        await this.runGameLoop();
      } catch (err) {
        if (err instanceof VNInterruptError) {
          console.warn('VN event interrupted, returning to menu or resetting.');
        } else {
          console.error('Engine error:', err);
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      }
      // Wait for state to become RUNNING again (e.g., after new game)
      while (this.engineState.state !== 'RUNNING') {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  async runGameLoop() {
    console.log('Starting Game engine...', this.engineState.state);
    // Boucle principale du VN tant que RUNNING
    while (this.engineState.state === 'RUNNING') {
      // 1. Charger les events valides pour la location courante
      const { immediateEvent, drawableEvents } = await this.getEvents();
      console.debug(
        `getEvents returned: immediateEvent=${
          immediateEvent ? immediateEvent.id : 'none'
        }, drawableEvents=${drawableEvents.length}`
      );
      if (immediateEvent) {
        this.engineState.currentEvent = immediateEvent.id;
        this.engineState.currentStep = 0;
        await this.handleEvent(immediateEvent);
      } else {
        /*
        // 3. Afficher les events "drawables" (choix, etc.)
        for (const drawableEvent of drawableEvents) {
          if (drawableEvent.draw) {
            drawableEvent.draw(this, this.gameState);
          }
        }
        // 4. Attendre une action du joueur (clic, etc.)
        await this.waitForPlayerAction();
        */
      }
      console.log("Petit sleep pour debug l'engine...");
      // Attendre un peu avant de vérifier à nouveau les events
      await new Promise((resolve) => setTimeout(resolve, 20000));
    }
  }
  // #endregion

  findEventById(eventId) {
    return null;
  }

  // #region events helpers
  async handleEvent(immediateEvent) {
    await EngineEvents.handleEvent(this, immediateEvent);
  }

  createEventsCopy() {
    EngineEvents.createEventsCopy(this);
  }

  async getEvents() {
    return await EngineEvents.getEvents(this);
  }

  //Engine events optimization to not re-check all events every time
  updateEvents(location) {
    EngineEvents.updateEvents(this, location);
  }
  // #endregion
}

export default Engine;
