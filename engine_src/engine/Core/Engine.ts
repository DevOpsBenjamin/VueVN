import {
  EngineSave,
  VNInterruptError,
  EngineErrors,
  SimulateRunner,
  HistoryManager,
  EventManager,
  InputManager,
  ActionExecutor,
  NavigationManager,
  LocationManager,
  ActionManager,
} from '@generate/engine';
import { EngineStateEnum } from '@generate/enums';
import type {
  GameState,
  EngineState,
  VNEvent,
  VNAction,
  GameStateStore,
  EngineStateStore,
} from '@generate/types';

class Engine {
  // #region DEFINITION
  gameState: GameStateStore;
  engineState: EngineStateStore;

  // Managers
  historyManager: HistoryManager;
  locationManager: LocationManager;
  actionManager: ActionManager;
  eventManager: EventManager;
  inputManager: InputManager | null = null;
  actionExecutor: ActionExecutor;
  navigationManager: NavigationManager;
  private static instance: Engine | null = null;
  private gameRoot: HTMLElement;

  constructor(
    gameState: GameStateStore,
    engineState: EngineStateStore,
    gameRoot: HTMLElement
  ) {
    // State
    this.gameState = gameState;
    this.engineState = engineState;
    this.gameRoot = gameRoot;

    // Initialize managers (order matters for dependencies)
    this.historyManager = new HistoryManager();
    this.eventManager = new EventManager();
    this.locationManager = new LocationManager();
    this.actionManager = new ActionManager();

    // Initialize NavigationManager first (ActionExecutor needs it)
    this.navigationManager = new NavigationManager(this.historyManager);
    this.actionExecutor = new ActionExecutor(
      engineState.$state,
      gameState.$state,
      this.historyManager,
      this.navigationManager
    );

    // Initialize window reference
    if (typeof window !== 'undefined') {
      const w = window as any;
      w.VueVN = this.gameState.$state;
    }
    Engine.instance = this;
  }

  static getInstance(): Engine | null {
    return this.instance;
  }

  setRootHTML(root: HTMLElement): void {
    this.gameRoot = root;
    this.inputManager = new InputManager(
      this.engineState,
      this.gameState,
      this.navigationManager,
      this.gameRoot
    );
    this.inputManager.init();
  }

  getGameSize(): number {
    const rect = this.gameRoot.getBoundingClientRect();
    return Math.floor(rect.height / 8);
  }
  // #endregion

  // #region SAVE engine
  startNewGame(): void {
    EngineSave.startNewGame(this);
  }

  loadGame(slot: number): Promise<void> {
    return EngineSave.loadGame(this, slot);
  }

  saveGame(slot: number, name?: string): void {
    EngineSave.saveGame(this, slot, name);
  }
  // #endregion

  // #region LOOP ENGINE
  // Main engine loop
  async run(): Promise<void> {
    while (true) {
      try {
        console.debug("rejectWaiters");
        this.navigationManager.rejectWaiters();
        console.debug("updateEventsCache");
        this.eventManager.updateEventsCache(this.gameState);
        console.debug("runGameLoop");
        await this.runGameLoop();
      } catch (err) {
        if (err instanceof VNInterruptError) {
          console.warn('VN CancelAwaiter Go back to base loop');
        } else {
          console.error('Engine error:', err);
          // DEBUG: Wait for dev to read error (will be removed in production)
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      }
      while (this.engineState.state !== EngineStateEnum.RUNNING) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  async runGameLoop(): Promise<void> {
    while (this.engineState.state === EngineStateEnum.RUNNING) {
      console.debug("GAME LOOP");
      const { immediateEvent, drawableEvents } =
        await this.eventManager.getEvents(this.gameState);
      if (immediateEvent) {
        console.debug("immediateEvent:", immediateEvent.name);
        await this.handleEvent(immediateEvent);
        //After event we always reset cache cause some variable (flags) can have changed
        this.eventManager.updateEventsCache(this.gameState);
      } else {
        // Calculate and update all engine info
        await this.calculateInfo();
        if (drawableEvents.length > 0) {
          console.warn("draw: ", drawableEvents);
        }
        console.debug("actionManager.wait()");
        // No event to draw no loopUntil either a Action Or a DrawableClick.
        await this.navigationManager.actionManager.wait();
      }
    }
  }

  // #region STATE MANAGEMENT
  /**
   * Calculate and update all engine information for the current loop iteration.
   * Orchestrates state reset, location handling, and action management.
   */
  private async calculateInfo(): Promise<void> {
    console.debug("calculateInfo:");
    // Reset state first
    this.cleanState();

    // Handle location logic (background, time-based backgrounds)
    await this.handleLocation();

    // Update action manager with current available actions
    await this.updateActions();
  }

  /**
   * Clean state at the beginning of each loop iteration.
   * Resets important UI fields that should be cleared between events.
   */
  private cleanState(): void {
    // Clear visual elements
    this.engineState.background = null;
    this.engineState.foreground = null;
    this.engineState.dialogue = null;
    this.engineState.choices = null;
  }

  /**
   * Handle location-specific logic.
   * Sets background from current location and applies time-based backgrounds if applicable.
   */
  private async handleLocation(): Promise<void> {
    try {
      console.debug("handleLocation: ", this.gameState.location_id);
      const currentLocation = this.locationManager.findById(
        this.gameState.location_id
      );
      this.locationManager.updateLocations(this.gameState.location_id);

      // Set base background
      this.engineState.background = currentLocation.baseBackground;

      // Check for time-based background overrides
      if (
        currentLocation.timeBackgrounds &&
        currentLocation.timeBackgrounds.length > 0
      ) {
        for (const timeBackground of currentLocation.timeBackgrounds) {
          if (timeBackground.check(this.gameState)) {
            this.engineState.background = timeBackground.value;
            break; // Use first matching time background
          }
        }
      }
    } catch (error) {
      console.error('[Engine] Error handling location:', error);
    }
  }

  /**
   * Update action manager by building list of currently accessible actions.
   * This ensures action overlay shows up-to-date available actions.
   */
  private async updateActions(): Promise<void> {
    console.debug("updateActions");
    // Update ActionManager's internal accessible actions list (now async for location-centric loading)
    await this.actionManager.updateAccessibleActions(this.gameState.$state);
  }
  // #endregion

  // #region Event EXECUTOR
  async handleEvent(immediateEvent: VNEvent): Promise<void> {
    try {
      // ActionExecutor handles everything: simulation + playback + choice branches
      await this.actionExecutor.executeEvent(immediateEvent);
    } catch (error: any) {
      if (error.message === 'JumpInterrupt') {
        // Jump was triggered - the ActionExecutor has already set engineState.currentEvent
        // Let the engine loop handle the new event
        console.log(
          'Jump interrupt caught - will execute new event:',
          this.engineState.currentEvent
        );
        return;
      }
      console.error('Event execution error:', error);
      throw error;
    }
  }
  // #endregion
}

export default Engine;
