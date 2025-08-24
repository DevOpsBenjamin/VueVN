import {
  EngineSave,
  VNInterruptError,
  EngineErrors,
  SimulateRunner,
  HistoryManager,
  EventManager,
  InputManager,
  ActionExecutor,
  NavigationManager
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

  // Delegate methods to NavigationManager  
  resolveContinue(): void {
    this.navigationManager.resolveContinue();
  }

  resolveChoice(choiceId: string): void {
    this.navigationManager.resolveChoice(choiceId);
  }

  cancelWaiters(): void {
    this.navigationManager.cancelWaiters();
  }

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
      const { immediateEvent, drawableEvents } = await this.eventManager.getEvents(this.gameState);
      if (immediateEvent) {
        await this.handleEvent(immediateEvent);
      } else {
        // Handle drawable events if needed
      }
      
      // DEBUG: Sleep for debugging
      console.warn("SLEEP FOR DEBUG");
      await new Promise((resolve) => setTimeout(resolve, 20000));
    }
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