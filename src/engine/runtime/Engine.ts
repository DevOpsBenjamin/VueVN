import {
  EngineSave,
  VNInterruptError,
  EngineErrors,
  SimulateRunner,
  CustomRegistry,
  HistoryManager,
  EventManager,
  InputManager
} from "@/generate/runtime";
import { 
  EngineStateEnum,
} from "@/generate/types";
import type { 
  GameState, 
  EngineState, 
  VNEvent, 
  VNAction, 
  HistoryEntry
} from "@/generate/types";

class Engine {
  gameState: GameState;
  engineState: EngineState;
  historyManager: HistoryManager;
  eventManager: EventManager;
  inputManager: InputManager;

  awaiterResult: ((value: any) => void) | null;
  /*
  replayMode: boolean;
  targetStep: number;
  eventCache: Record<
    string,
    { notReady: VNEvent[]; unlocked: VNEvent[]; locked: VNEvent[] }
  >;

  private customLogicCache: Record<string, any>;
  private skipMode: boolean = false;
  private keyboardLayout: 'qwerty' | 'azerty' = 'qwerty';
  private keyboardDetected: boolean = false;
  private currentActions: VNAction[] = [];
  private navigationAwaiter: ((value: any) => void) | null = null;
  */

  constructor(gameState: GameState, engineState: EngineState) {
    // State
    this.gameState = gameState;
    this.engineState = engineState;
    // Manager
    this.historyManager = new HistoryManager();
    this.eventManager = new EventManager();
    this.inputManager = new InputManager();

    // Other
    this.awaiterResult = null;
    //this.replayMode = false;
    //this.targetStep = 0;
    //this.eventCache = {};
    //this.customLogicCache = {};
    this.detectKeyboardLayout();
    
    if (typeof window !== "undefined") {
      const w = window as any;
      if (!w.__VN_ENGINE__) {
        console.debug("Initializing VN Engine instance");
        w.VueVN = this.gameState;
        w.__VN_ENGINE__ = this;
        this.initVNInputHandlers();
      }
    }
  }

  //Getting engine from window
  static getInstance(): Engine | undefined {
    if (typeof window !== "undefined") {
      const w = window as any;
      if (w.__VN_ENGINE__) {
        return w.__VN_ENGINE__ as Engine
      }
    }
    return undefined;
  }

  resolveAwaiter(result: any): void {
    if (this.awaiterResult) {
      console.debug("Resolving awaiter with result:", result);
      this.awaiterResult(result);
      this.cleanAwaiter();
    } else {
      console.debug("No awaiter to resolve");
    }
  }

  cancelAwaiter(): void {
    if (this.awaiterResult) {
      console.debug("Cancelling awaiter");
      this.awaiterResult(Promise.reject(new VNInterruptError()));
      this.cleanAwaiter();
    } else {
      console.debug("No awaiter to cancel");
    }
  }

  cleanAwaiter(): void {
    this.awaiterResult = null;
    this.engineState.dialogue = null;
    (this.engineState as any).choices = null;
  }

  async run(): Promise<void> {
    while (true) {
      try {
        await this.runGameLoop();
      } 
      catch (err) {
        if (err instanceof VNInterruptError) {
          console.warn("VN event interrupted, returning to menu or resetting.");
        } else {
          console.error("Engine error:", err);
          // IN CASE OF ERROR WE WAIT TO LET DEV READ ERROR (WILL BE REMOVED IN PRODUCTION)
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      }
      while (this.engineState.state !== "RUNNING") {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  async runGameLoop(): Promise<void> {
    while (this.engineState.state === "RUNNING") {
      const { immediateEvent, drawableEvents } = await this.eventManager.getEvents(this.gameState);
      if (immediateEvent) {
        this.engineState.currentEvent = immediateEvent.id;
        this.engineState.currentStep = 0;
        await this.handleEvent(immediateEvent);
      } else {
        // placeholder for drawable events
      }
      console.log("Petit sleep pour debug l'engine...");
      await new Promise((resolve) => setTimeout(resolve, 20000));
    }
  }


  async handleEvent(immediateEvent: VNEvent): Promise<void> {
    console.debug(`Processing event with dual-phase execution: ${immediateEvent.id}`);
    
    try {
      // Phase 1: Simulation - generate action sequence with pre-calculated results
      const actionSequence = await this.simulateEvent(immediateEvent);
      
      // Phase 2: Pre-fill future with all simulated actions for navigation
      this.historyState.future.splice(0); // Clear any existing future
      actionSequence.forEach(action => this.historyState.future.push(action));
      this.engineState.currentEvent = immediateEvent.id;
      this.engineState.currentStep = 0;
      
      console.log(`PRE-FILLED FUTURE with ${actionSequence.length} actions`);
      console.log(`FUTURE (${this.historyState.future.length}):`, JSON.parse(JSON.stringify(this.historyState.future)));
      
      // Start navigation (first goForward will move action from future to history)
      await this.goForward();
      
      console.debug(`Event ${immediateEvent.id} completed`);
      
    } catch (error) {
      if (error instanceof EngineErrors.JumpInterrupt) {
        console.debug(`Event ${immediateEvent.id} interrupted by jump to ${error.targetEventId}`);
        // Jump handling will be done by main game loop
      } else {
        console.error(`Error processing event ${immediateEvent.id}:`, error);
        throw error;
      }
    }
  }

  /**
   * Phase 1: Simulate event execution to generate action sequence with state snapshots
   */
  private async simulateEvent(event: VNEvent): Promise<VNAction[]> {
    const actions: VNAction[] = [];
    this.engineState.isSimulating = true;
    
    // Create copies of state to work on during simulation
    const gameStateCopy = JSON.parse(JSON.stringify(this.gameState));
    const engineStateCopy = JSON.parse(JSON.stringify(this.engineState));
    
    console.debug(`Simulating event: ${event.id}`);
    
    try {
      const simulationAPI = this.createSimulationAPI(actions, gameStateCopy, engineStateCopy);
      await event.execute(simulationAPI, gameStateCopy);
    } catch (jumpInterrupt) {
      // Expected for choices and jumps - simulation ends here
      console.debug(`Simulation ended with jump interrupt`);
    } finally {
      this.engineState.isSimulating = false;
    }
    
    // TODO: Remove debug logs when engine is stable - requested for development debugging
    console.log(`SIMULATED EVENT: ${event.name || event.id}`);
    console.log(`GENERATED ACTIONS (${actions.length}):`, actions.map(a => a.type));
    console.log(`HISTORY (${this.historyState.history.length}):`, JSON.parse(JSON.stringify(this.historyState.history)));
    console.log(`FUTURE (${this.historyState.future.length}):`, JSON.parse(JSON.stringify(this.historyState.future)));
    
    return actions;
  }

  /**
   * Phase 2: Execute actions with real user interaction
   */
  private async playbackActions(actions: VNAction[]): Promise<void> {
    console.debug(`Playing back ${actions.length} actions`);
    
    for (let i = this.engineState.currentStep; i < actions.length; i++) {
      const action = actions[i];
      
      // Record state before action for history
      this.recordHistory(action);
      
      // Execute action with real user interaction
      await this.executeAction(action);
      
      this.engineState.currentStep = i + 1;
    }
  }

  /**
   * Execute a single action with real user interaction
   */
  private async executeAction(action: VNAction): Promise<void> {
    switch (action.type) {
      case 'showText':
        this.engineState.dialogue = { 
          text: action.text, 
          from: action.from || 'Narrator' 
        };
        await this.waitForContinue();
        break;

      case 'setBackground':
        this.engineState.background = action.imagePath;
        break;

      case 'setForeground':
        this.engineState.foreground = action.imagePath;
        break;

      case 'showChoices':
        this.engineState.choices = action.choices;
        const choiceId = await this.waitForChoice();
        this.recordChoiceInHistory(choiceId);
        break;

      case 'jump':
        this.jumpToEvent(action.eventId);
        throw new EngineErrors.JumpInterrupt(action.eventId);
        break;

      case 'runCustomLogic':
        const result = await this.executeCustomLogic(action.logicId, action.args);
        this.cacheCustomLogicResult(action.logicId, result);
        // Custom logic exits event flow
        throw new EngineErrors.JumpInterrupt('EXIT_EVENT');
        break;

      default:
        console.warn(`Unknown action type: ${(action as any).type}`);
    }
  }

  /**
   * Record current state and action in history
   */
  private recordHistory(action: VNAction): void {
    // Create snapshot of current state
    const entry: HistoryEntry = {
      action,
      gameStateBefore: JSON.parse(JSON.stringify(this.gameState)),
      engineStateBefore: JSON.parse(JSON.stringify(this.engineState)),
      timestamp: Date.now()
    };
    
    this.historyState.addToHistory(entry);
  }

  /**
   * Wait for user to continue (right click or space)
   * Skip mode bypasses this wait
   */
  private async waitForContinue(): Promise<void> {
    // Skip mode: don't wait, continue immediately
    if (this.skipMode) {
      console.debug("Skip mode active: bypassing wait");
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve) => {
      this.awaiterResult = resolve;
    });
  }

  /**
   * Wait for user to select a choice
   */
  private async waitForChoice(): Promise<string> {
    return new Promise<string>((resolve) => {
      this.awaiterResult = resolve;
    });
  }

  /**
   * Get historical choice for replay (placeholder)
   */
  private getHistoricalChoice(): string | null {
    // TODO: Implement historical choice lookup
    return null;
  }

  /**
   * Record choice in history (placeholder)
   */
  private recordChoiceInHistory(choiceId: string): void {
    // TODO: Record choice in last history entry
    console.debug(`Choice made: ${choiceId}`);
  }

  /**
   * Jump to a new event
   */
  private jumpToEvent(eventId: string): void {
    this.engineState.currentEvent = eventId;
    this.engineState.currentStep = 0;
    console.debug(`Jumping to event: ${eventId}`);
  }

  /**
   * Execute custom logic function
   */
  private async executeCustomLogic(logicId: string, args: any): Promise<any> {
    const logicFunction = CustomLogicRegistry.get(logicId);
    if (!logicFunction) {
      throw new Error(`Custom logic '${logicId}' not found`);
    }

    // For timing minigame, activate UI state
    if (logicId === 'timingMinigame') {
      this.engineState.minigame = {
        active: true,
        type: 'timing',
        props: args
      };
      
      // Wait for minigame result from UI
      const result = await this.waitForMinigameResult();
      
      // Deactivate minigame UI
      this.engineState.minigame = {
        active: false,
        type: null,
        props: null
      };
      
      // Update game state
      if (!this.gameState.player.money) {
        this.gameState.player.money = 0;
      }
      this.gameState.player.money += result.reward;
      
      if (!this.gameState.flags.lastMinigameResult) {
        this.gameState.flags.lastMinigameResult = {};
      }
      this.gameState.flags.lastMinigameResult = result;
      
      console.log(`Timing game completed: ${result.zone} zone, ${result.reward} money earned`);
      return result;
    } else {
      // Execute standard custom logic - this exits event context
      const result = await logicFunction(args, this.gameState);
      return result;
    }
  }

  /**
   * Wait for minigame result from UI component
   */
  private async waitForMinigameResult(): Promise<any> {
    return new Promise<any>((resolve) => {
      this.awaiterResult = resolve;
    });
  }

  /**
   * Cache custom logic result for history navigation
   */
  private cacheCustomLogicResult(logicId: string, result: any): void {
    this.customLogicCache[logicId] = result;
  }

  /**
   * Go back one step in history
   */
  async goBack(): Promise<void> {
    if (!this.historyState.canGoBack()) {
      console.warn("No history to go back to");
      return;
    }

    // Cancel any pending awaiters (choice, navigation, etc.)
    if (this.awaiterResult) {
      console.warn("GOBACK: Cancelling pending awaiter");
      this.awaiterResult = null;
    }
    if (this.navigationAwaiter) {
      console.warn("GOBACK: Cancelling pending navigation awaiter");
      this.navigationAwaiter = null;
    }

    console.warn("Going back in history...");
    
    // Get the last action from history (this is what we want to undo)
    const lastAction = this.historyState.moveToHistory(); // Remove from history
    if (lastAction) {
      // Move this action to future (so we can redo it later)
      this.historyState.moveToFuture(lastAction);
      
      // Check if we're moving to a different event (cross-event navigation)
      const targetEventId = lastAction.event_id;
      const currentEventId = this.engineState.currentEvent;
      
      if (targetEventId && targetEventId !== currentEventId) {
        console.warn(`GOBACK - Cross-event navigation: ${currentEventId} -> ${targetEventId}`);
        
        // Switch event context
        this.engineState.currentEvent = targetEventId;
        
        // Reset current step to match the action's position in the target event
        if (lastAction.engineStateCopy && typeof lastAction.engineStateCopy.currentStep === 'number') {
          this.engineState.currentStep = lastAction.engineStateCopy.currentStep;
        }
      }
      
      // We need to restore to the state BEFORE this action
      // Look at the previous action in history to get the "before" state
      if (this.historyState.history.length > 0) {
        // Get the previous action's state (this becomes our current state)
        const previousAction = this.historyState.history[this.historyState.history.length - 1];
        Object.assign(this.gameState, previousAction.gameStateCopy);
        Object.assign(this.engineState, previousAction.engineStateCopy);
      } else {
        // No previous action - stay in current state completely
        // Don't clear anything - we're at the first action and should see it
        console.warn("GOBACK - At first action, keeping current state intact");
      }
      
      console.warn(`GOBACK - Undid action: ${lastAction.type}`);
    }
  }

  /**
   * Main navigation method - go forward to next action and wait for user input
   */
  async goForward(): Promise<void> {
    // Check if we have any actions in future to process
    if (this.historyState.future.length === 0) {
      console.log("GOFORWARD: End of actions reached - no more future actions");
      return;
    }

    // Cancel any pending awaiters before moving forward
    if (this.awaiterResult) {
      console.warn("GOFORWARD: Cancelling pending awaiter");
      this.awaiterResult = null;
    }
    if (this.navigationAwaiter) {
      console.warn("GOFORWARD: Cancelling pending navigation awaiter");
      this.navigationAwaiter = null;
    }
    
    // Get next action from future
    const nextAction = this.historyState.moveToHistoryFromFuture();
    if (!nextAction) {
      console.log("GOFORWARD: No action retrieved from future");
      return;
    }
    
    console.log(`GOFORWARD: Processing action: ${nextAction.type}`);
    
    // Check if we're moving to a different event (cross-event navigation)
    const targetEventId = nextAction.event_id;
    const currentEventId = this.engineState.currentEvent;
    
    if (targetEventId && targetEventId !== currentEventId) {
      console.warn(`GOFORWARD - Cross-event navigation: ${currentEventId} -> ${targetEventId}`);
      
      // Switch event context
      this.engineState.currentEvent = targetEventId;
    }
    
    // Apply the action's pre-calculated state snapshot
    try {
      this.applyActionToEngine(nextAction);
    } catch (error) {
      if (error instanceof EngineErrors.JumpInterrupt) {
        console.log(`GOFORWARD: Jump encountered to ${error.targetEventId}`);
        // Handle jump during history navigation - the jump will be processed by main game loop
        // Add this action to history first, then let the jump propagate
        this.historyState.addBackToHistory(nextAction);
        throw error; // Re-throw to let main game loop handle the jump
      }
      throw error; // Re-throw other errors
    }
    
    // Add this action to history (it contains the state snapshot)
    this.historyState.addBackToHistory(nextAction);
    
    
    // Handle special actions
    if (nextAction.type === 'showChoices') {
      // For choices, wait for user selection (not skip mode)
      await this.waitForChoice();
    } else if (nextAction.type === 'runCustomLogic') {
      // Execute custom logic now (not simulated)
      await this.executeCustomLogic(nextAction);
    } else {
      // Normal actions: wait for user input unless skip mode
      if (!this.skipMode) {
        await this.waitForNavigation();
      }
    }
  }

  /**
   * Apply an action's complete state snapshot to current state
   */
  private applyActionToEngine(action: VNAction): void {
    console.debug(`APPLYING ACTION: ${action.type}`, action);
    
    if (action.type === 'jump') {
      // Handle jumps separately
      console.log(`APPLYING JUMP to: ${action.eventId}`);
      throw new EngineErrors.JumpInterrupt(action.eventId);
    }
    
    if (action.gameStateCopy && action.engineStateCopy) {
      // Restore complete state snapshots from simulation
      Object.assign(this.gameState, action.gameStateCopy);
      Object.assign(this.engineState, action.engineStateCopy);
      
      console.warn(`APPLIED STATE SNAPSHOT for ${action.type}`);
      console.warn(`- Game state restored`);
      console.warn(`- Engine state restored (dialogue, background, foreground, etc.)`);
    } else {
      console.warn(`Action ${action.type} missing state snapshots - old format?`, action);
    }
  }

  /**
   * Wait for user navigation input (the main await in dual-phase engine)
   */
  private async waitForNavigation(): Promise<void> {
    console.warn("WAITING FOR NAVIGATION INPUT...");
    return new Promise<void>((resolve) => {
      this.navigationAwaiter = resolve;
    });
  }

  /**
   * Execute custom logic (not simulated, real execution)
   */
  private async executeCustomLogic(action: VNAction): Promise<void> {
    console.log(`EXECUTING CUSTOM LOGIC: ${action.logicId}`);
    
    try {
      // Execute the actual custom logic with current state
      const result = await CustomLogicRegistry.execute(action.logicId, action.args, this.gameState, this);
      
      // Cache the result for potential replay
      this.customLogicCache[action.logicId] = result;
      
      // Apply any state changes from custom logic
      console.log(`CUSTOM LOGIC COMPLETED: ${action.logicId}`, result);
      
    } catch (error) {
      console.error(`Custom logic error: ${action.logicId}`, error);
      // Continue with cached result if available
      if (this.customLogicCache[action.logicId]) {
        console.log(`Using cached result for ${action.logicId}`);
      }
    }
  }

  /**
   * Resolve the navigation awaiter to continue forward
   */
  private resolveNavigation(): void {
    if (this.navigationAwaiter) {
      console.debug("RESOLVING NAVIGATION - calling goForward()");
      this.navigationAwaiter();
      this.navigationAwaiter = null;
      // After resolving, call goForward for next action
      this.goForward();
    } else {
      console.warn("No navigation awaiter to resolve");
    }
  }
}

export default Engine;
