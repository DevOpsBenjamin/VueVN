// Import generated event index (adjust path as needed)
import { events as eventIndex } from '@/generate/events';
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
    // Expose for debug/cheat
    if (typeof window !== 'undefined') {
      // Expose pinia store for people wanting to cheat
      window.VueVN = this.gameState;
      // Expose engine instance globally
      window.__VN_ENGINE__ = this;
    }
  }

  startNewGame() {
    this.engineState.resetGame();
    this.gameState.resetGame();
    this.createEventsCopy();
    this.updateEvents();
    this.engineState.state = 'RUNNING';
  }

  //Events local cache for optimization of event checking
  createEventsCopy() {
    // Deep copy all events per location into notChecked
    this.eventCache = {};
    for (const location in eventIndex) {
      this.eventCache[location] = {
        notReady: [...eventIndex[location]],
        unlocked: [],
        locked: [],
      };
    }
  }

  async run() {
    console.log('Starting VN engine...', this.engineState.state);
    // Wait for engine state to be RUNNING (e.g., after New Game)
    while (this.engineState.state !== 'RUNNING') {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log('Starting Game engine...', this.engineState.state);
    // Boucle principale du VN
    while (true) {
      // 1. Charger les events valides pour la location courante
      const { immediateEvent, drawableEvents } = await this.getEvents();
      console.debug(
        `getEvents returned: immediateEvent=${
          immediateEvent ? immediateEvent.id : 'none'
        }, drawableEvents=${drawableEvents.length}`
      );

      if (immediateEvent) {
        // 2. Exécuter le premier event valide (auto-trigger)
        console.debug('Executing immediate event:', immediateEvent.id);
        await immediateEvent.execute(this, this.gameState);
        await new Promise((resolve) => setTimeout(resolve, 20000));
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
    }
  }

  /**
   * Charge dynamiquement les events de la location courante, sépare immédiats/drawables
   * @returns {Promise<{immediateEvent: object|null, drawableEvents: object[]}>}
   */
  async getEvents() {
    console.debug('Loading events for location:', this.gameState.location);
    const location = this.gameState.location;
    const eventList = this.eventCache[location].unlocked || [];
    console.debug(`Found ${eventList.length} events for location: ${location}`);
    const drawableEvents = [];
    for (const event of eventList) {
      if (
        typeof event.conditions === 'function' &&
        event.conditions(this.gameState)
      ) {
        if (typeof event.draw !== 'function') {
          console.debug(`Event ${event.id} is immediate, executing directly`);
          return { immediateEvent: event, drawableEvents: [] };
        } else {
          drawableEvents.push(event);
        }
      }
    }
    // No immediate event, return all drawable events
    return { immediateEvent: null, drawableEvents };
  }

  /**
   * Show text and await user to continue (space/click/right), or menu (escape)
   * Stores resolver for menu integration
   */
  async showText(text) {
    // Set engine state for UI
    this.engineState.messageShow = true;
    this.engineState.currentText = text;
    return new Promise((resolve) => {
      this._resumeAwait = resolve;
      const onKey = (e) => {
        if (e.key === 'Escape') {
          this.engineState.state = 'MENU';
          // Do not resolve, menu will resume
        } else if (
          e.key === ' ' ||
          e.key === 'Enter' ||
          e.key === 'ArrowRight'
        ) {
          cleanup();
          resolve('continue');
        }
      };
      const onClick = (e) => {
        // Right side = continue, left = back (optional)
        if (e.clientX > window.innerWidth / 2) {
          cleanup();
          resolve('continue');
        } else {
          // Optionally: resolve('back')
        }
      };
      function cleanup() {
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('click', onClick);
        if (this._resumeAwait === resolve) this._resumeAwait = null;
      }
      window.addEventListener('keydown', onKey);
      window.addEventListener('click', onClick);
    });
  }

  // Helpers à implémenter selon ton archi
  async waitForIdle() {
    // Ex: attendre que messageShow/choiceShow soit false
    while (this.engineState.messageShow || this.engineState.choiceShow) {
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  async getAvailableEvents() {
    // Ex: charger dynamiquement tous les events de la location courante
    // Ici, retourne un tableau d'events valides (mock pour l'exemple)
    return [];
  }

  async waitForPlayerAction() {
    // Ex: attendre un clic ou une action utilisateur
    await new Promise((resolve) => {
      const handler = () => {
        window.removeEventListener('click', handler);
        resolve();
      };
      window.addEventListener('click', handler);
    });
  }

  updateEvents(location) {
    console.debug('Updating events for location:', location || 'all');

    // If location is provided, only update that location; else update all
    const locations = location ? [location] : Object.keys(this.eventCache);
    for (const loc of locations) {
      const cache = this.eventCache[loc];
      if (!cache) {
        continue;
      }
      const stillNotReady = [];
      for (const event of cache.notReady) {
        if (
          typeof event.locked === 'function' &&
          event.locked(this.gameState)
        ) {
          cache.locked.push(event);
        } else if (
          typeof event.unlocked === 'function' &&
          event.unlocked(this.gameState)
        ) {
          cache.unlocked.push(event);
        } else {
          stillNotReady.push(event);
        }
      }
      cache.notReady = stillNotReady;
      console.debug(
        `Events updated for location:${loc},
        Unlocked: ${cache.unlocked.length}, 
        Locked: ${cache.locked.length}, 
        Not Ready: ${cache.notReady.length}`
      );
    }
  }
}

export default Engine;
