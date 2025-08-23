import {
  VNInterruptError,
  EngineErrors,
  SimulateRunner,
  HistoryManager,
  EventManager,
  InputManager,
  ActionExecutor,
  WaitManager,
  NavigationManager
} from "@/generate/runtime";
import { EngineStateEnum } from "@/generate/enums";
import type { 
  GameState, 
  EngineState, 
  VNEvent, 
  VNAction
} from "@/generate/types";

class Engine {
  gameState: GameState;
  engineState: EngineState;
  
  // Managers
  historyManager: HistoryManager;
  eventManager: EventManager;
  inputManager: InputManager;
  actionExecutor: ActionExecutor;
  waitManager: WaitManager;
  navigationManager: NavigationManager;

  constructor(gameState: GameState, engineState: EngineState) {
    // State
    this.gameState = gameState;
    this.engineState = engineState;
    
    // Initialize managers
    this.historyManager = new HistoryManager();
    this.eventManager = new EventManager();
    this.waitManager = new WaitManager();
    this.actionExecutor = new ActionExecutor(engineState, gameState);
    this.inputManager = new InputManager(engineState, gameState);
    this.navigationManager = new NavigationManager(
      engineState, 
      gameState, 
      this.historyManager, 
      this.waitManager, 
      this.actionExecutor
    );
    
    // Setup callbacks
    this.inputManager.setNavigationCallbacks(
      () => this.waitManager.resolveNavigation(() => this.navigationManager.goForward()),
      () => this.navigationManager.goBack()
    );
    
    // Initialize window reference
    if (typeof window !== "undefined") {
      const w = window as any;
      if (!w.__VN_ENGINE__) {
        console.debug("Initializing VN Engine instance");
        w.VueVN = this.gameState;
        w.__VN_ENGINE__ = this;
        this.inputManager.initVNInputHandlers();
      }
    }
  }

  static getInstance(): Engine | undefined {
    if (typeof window !== "undefined") {
      const w = window as any;
      if (w.__VN_ENGINE__) {
        return w.__VN_ENGINE__ as Engine;
      }
    }
    return undefined;
  }

  // Delegate methods to WaitManager
  resolveAwaiter(result: any): void {
    this.waitManager.resolveAwaiter(result);
  }

  cancelAwaiter(): void {
    this.waitManager.cancelAwaiter();
  }

  cleanAwaiter(): void {
    this.waitManager.cleanAwaiter();
  }

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
      //IF AFTER A JUMP WE SHOULD RUN AN EVENT
      if (this.engineState.currentEvent != null)
      {
        const event = this.eventManager.findEventById(this.engineState.currentEvent)
        if (event != null) {
          await this.handleEvent(event);
        }
      }
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

  async handleEvent(immediateEvent: VNEvent): Promise<void> {    
    try {
      // Phase 1: Simulation - generate action sequence
      const actionSequence = await this.simulateEvent(immediateEvent);      
      // Phase 2: Playback - execute actions with user interaction  
      await this.playbackActions(actionSequence);      
    } catch (error) {
        console.error('Event execution error:', error);
        throw error;
    }
  }

  private async simulateEvent(event: VNEvent): Promise<VNAction[]> {    
    this.engineState.currentEvent = event.id;
    this.engineState.currentStep = 0;
    // Create simulation runner with copies of current state
    const gameStateCopy = JSON.parse(JSON.stringify(this.gameState));
    const engineStateCopy = JSON.parse(JSON.stringify(this.engineState));
    
    const simulator = new SimulateRunner(gameStateCopy, engineStateCopy, event.id);
    
    try {
      // Run event simulation to capture all actions
      await event.execute(simulator, gameStateCopy);
      return simulator.actions;
    } catch (error) {
      console.error('Simulation error:', error);
      return [];
    }
  }

  private async playbackActions(actions: VNAction[]): Promise<void> {
    this.historyManager.setFuture(actions);
    for (const action of actions) {      
      // Execute action with real user interaction
      await this.actionExecutor.executeAction(
        action,
        () => this.waitManager.waitForContinue(),
        () => this.waitManager.waitForChoice()
      );
    }
  }
}

export default Engine;