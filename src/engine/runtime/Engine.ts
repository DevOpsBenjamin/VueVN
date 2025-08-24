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
  LocationManager
} from "@/generate/runtime";
import { EngineStateEnum } from "@/generate/enums";
import type { 
  GameState, 
  EngineState, 
  VNEvent, 
  VNAction,
  GameStateStore,
  EngineStateStore
} from "@/generate/types";

class Engine {
  // #region DEFINITION
  gameState: GameStateStore;
  engineState: EngineStateStore;
  
  // Managers
  historyManager: HistoryManager;
  locationManager: LocationManager;
  eventManager: EventManager;
  inputManager: InputManager;
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
    
    // Initialize NavigationManager first (ActionExecutor needs it)
    this.navigationManager = new NavigationManager(engineState, gameState, this.historyManager);    
    this.inputManager = new InputManager(engineState, gameState, this.navigationManager, gameRoot);
    this.actionExecutor = new ActionExecutor(engineState, gameState, this.historyManager, this.navigationManager);
    this.inputManager.init();
    
    // Initialize window reference
    if (typeof window !== "undefined") {
      const w = window as any;
      w.VueVN = this.gameState;
    }
    Engine.instance = this;
  }

  static getInstance(): Engine | null {
    return this.instance;
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
        await this.runGameLoop();
      } catch (err) {
        if (err instanceof VNInterruptError) {
          console.warn("VN event interrupted, returning to menu or resetting.");
        } else {
          console.error("Engine error:", err);
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
      // Clean state at start of each loop iteration
      this.cleanState();
      
      // Handle location-based logic
      await this.handleLocation();
      
      
      // DEBUG: Sleep for debugging
      console.warn("SLEEP FOR DEBUG");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const { immediateEvent, drawableEvents } = await this.eventManager.getEvents(this.gameState);
      if (immediateEvent) {
        await this.handleEvent(immediateEvent);
        //After event we always reset cache cause some variable (flags) can have changed
        this.eventManager.updateEventsCache(this.gameState)
      } else if (drawableEvents.length > 0) {
        // Handle drawable events if needed
      }
      
    }
  }

  // #region STATE MANAGEMENT
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
    
    // Clear any other transient state that shouldn't persist between loops
    // TODO: Add other fields that need cleaning each loop
  }

  /**
   * Handle location-specific logic.
   * Placeholder for location-based processing.
   */
  private async handleLocation(): Promise<void> {
    // TODO: Implement location-specific logic
    // This will handle things like:
    // - Location transitions
    // - Location-specific state updates  
    // - Background/environment setup
    // - Location-based event filtering
  }
  // #endregion

  // #region Event EXECUTOR
  async handleEvent(immediateEvent: VNEvent): Promise<void> {    
    try {
      // ActionExecutor handles everything: simulation + playback + choice branches
      await this.actionExecutor.executeEvent(immediateEvent);
    } catch (error) {
        console.error('Event execution error:', error);
        throw error;
    }
  }
  // #endregion
}

export default Engine;