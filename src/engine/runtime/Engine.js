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
  constructor(gameState, engineState) {
    this.gameState = gameState;
    this.engineState = engineState;
    // Expose for debug/cheat
    if (typeof window !== 'undefined') {
      window.VueVN = this.gameState;
    }
  }

  async run() {
    // Boucle principale du VN
    while (true) {
      // 1. Rien à faire, attendre une action du joueur (clic, etc.)
      await this.waitForPlayerAction();
      // 2. Charger les events valides pour la location courante
      const { immediateEvent, drawableEvents } = await this.getEvents();
      if (immediateEvent) {
        // 3. Exécuter le premier event valide (auto-trigger)
        await immediateEvent.execute(this, this.gameState);
      } else {
        for (const drawableEvent of drawableEvents) {
          if (drawableEvent.draw) {
            await drawableEvent.draw(this, this.gameState);
          }
        }
      }
    }
  }

  /**
   * Charge dynamiquement les events de la location courante, sépare immédiats/drawables
   * @returns {Promise<{immediateEvent: object|null, drawableEvents: object[]}>}
   */
  async getEvents() {
    const location = this.gameState.location;
    let events = [];
    /*
    try {
      // Chargement dynamique des events pour la location courante
      // (Suppose un dossier public/game/events/[location]/)
      const eventList = window.__VN_EVENT_INDEX?.[location] || [];
      for (const eventId of eventList) {
        const eventModule = await import(
          `/game/events/${location}/${eventId}.js?${Date.now()}`
        );
        const event = eventModule.default;
        if (
          typeof event.conditions === 'function' &&
          event.conditions(this.gameState)
        ) {
          events.push(event);
        }
      }
    } catch (e) {
      // Aucun event ou erreur de chargement
      events = [];
    }
    // Séparer immédiat/drawable
    let immediateEvent = null;
    const drawableEvents = [];
    for (const event of events) {
      if (event.immediate === true) {
        immediateEvent = event;
        break;
      } else if (typeof event.draw === 'function') {
        drawableEvents.push(event);
      }
    }*/
    let immediateEvent = null;
    const drawableEvents = [];
    return { immediateEvent, drawableEvents };
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
}

export default Engine;
