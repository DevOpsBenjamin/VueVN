import {
  EngineEvents,
  EngineAPI,
  EngineSave,
  VNInterruptError,
} from "@/generate/runtime";
import { engineStateEnum as ENGINE_STATES } from "@/generate/stores";
import useHistoryState from '../stores/historyState';
import type { 
  GameState, 
  EngineState, 
  VNEvent, 
  VNAction, 
  HistoryEntry, 
  EngineAPIForEvents,
  Choice 
} from "./types";
import { EngineErrors } from '@/generate/runtime';
import { CustomLogicRegistry } from '@/generate/runtime';

class Engine {
  gameState: GameState;
  engineState: EngineState;
  historyState: ReturnType<typeof useHistoryState>;
  awaiterResult: ((value: any) => void) | null;
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

  constructor(gameState: GameState, engineState: EngineState) {
    this.gameState = gameState;
    this.engineState = engineState;
    this.historyState = useHistoryState();
    this.awaiterResult = null;
    this.replayMode = false;
    this.targetStep = 0;
    this.eventCache = {};
    this.customLogicCache = {};

    // Initialize new engine state properties for dual-phase execution
    if (typeof this.engineState.currentStep === 'undefined') {
      this.engineState.currentStep = 0;
    }
    
    // Detect keyboard layout
    this.detectKeyboardLayout();
    if (typeof this.engineState.isSimulating === 'undefined') {
      this.engineState.isSimulating = false;
    }
    if (typeof this.engineState.isFastForwarding === 'undefined') {
      this.engineState.isFastForwarding = false;
    }
    if (!this.engineState.minigame) {
      this.engineState.minigame = {
        active: false,
        type: null,
        props: null
      };
    }

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

  static getInstance(): Engine | undefined {
    return typeof window !== "undefined"
      ? ((window as any).__VN_ENGINE__ as Engine)
      : undefined;
  }

  // #region Engine API for events and UI
  setBackground(imagePath: string): void {
    EngineAPI.setBackground(this, imagePath);
  }

  setForeground(imagePath: string): void {
    EngineAPI.setForeground(this, imagePath);
  }

  async showText(text: string, from = "engine"): Promise<void> {
    await EngineAPI.showText(this, text, from);
  }

  async showChoices(
    choices: Array<{ text: string; id: string }>,
  ): Promise<string> {
    return await EngineAPI.showChoices(this, choices);
  }
  // #endregion

  // #region SAVE engine
  startNewGame(): void {
    EngineSave.startNewGame(this);
  }

  loadGame(slot: string): Promise<void> {
    return EngineSave.loadGame(this, slot);
  }

  saveGame(slot: string, name?: string): void {
    console.log(`ENGINE CALL: Saving game to slot ${slot}`);
    EngineSave.saveGame(this, slot, name);
  }
  // #endregion

  initVNInputHandlers(): void {
    window.addEventListener("keydown", (e) => {
      // Handle skip mode (Ctrl key)
      if (e.key === "Control") {
        this.skipMode = true;
        console.debug("Skip mode ON");
        return;
      }
      
      if (e.key === "Escape") {
        if (
          this.engineState.initialized &&
          this.engineState.state === ENGINE_STATES.MENU
        ) {
          this.engineState.state = ENGINE_STATES.RUNNING;
        } else {
          this.engineState.state = ENGINE_STATES.MENU;
        }
      } else if (e.key === "Space" || e.key === "ArrowRight") {
        // Forward navigation
        if (e.shiftKey && e.key === "ArrowRight") {
          this.resolveNavigation(); // History forward (redo)
        } else {
          this.resolveNavigation(); // Main forward navigation
        }
      } else if (e.key === "ArrowLeft") {
        this.goBack(); // History backward
      } else if (this.isForwardKey(e.key)) {
        // E key (works on both layouts) - forward
        this.resolveNavigation();
      } else if (this.isBackwardKey(e.key)) {
        // Q key (QWERTY) or A key (AZERTY) - backward
        this.goBack();
      } else if ((e.key === 'q' || e.key === 'Q') && !this.keyboardDetected) {
        // User pressed Q - they're likely on QWERTY, treat as backward
        this.keyboardLayout = 'qwerty';
        this.keyboardDetected = true;
        console.debug('Detected QWERTY layout (Q key pressed)');
        this.goBack();
      } else if ((e.key === 'a' || e.key === 'A') && !this.keyboardDetected) {
        // User pressed A - they might be on AZERTY trying to press Q, treat as backward
        this.keyboardLayout = 'azerty';
        this.keyboardDetected = true;
        console.debug('Detected AZERTY layout (A key pressed)');
        this.goBack();
      } else {
        console.debug(`Unhandled key: ${e.key}`);
      }
    });
    
    window.addEventListener("keyup", (e) => {
      // Handle skip mode release
      if (e.key === "Control") {
        this.skipMode = false;
        console.debug("Skip mode OFF");
      }
    });
    window.addEventListener("click", (e) => {
      if (e.clientX > window.innerWidth / 2) {
        if (this.engineState.state === ENGINE_STATES.RUNNING) {
          this.resolveNavigation(); // Main forward navigation
        } else {
          console.debug("Click ignored, not in RUNNING state");
        }
      } else {
        // Left side click - go back
        if (this.engineState.state === ENGINE_STATES.RUNNING) {
          this.goBack();
        }
      }
    });
  }

  private detectKeyboardLayout(): void {
    // Start with QWERTY as default (most common)
    this.keyboardLayout = 'qwerty';
    console.debug('Keyboard layout: Starting with QWERTY (will auto-detect on first Q/A key press)');
  }

  private isForwardKey(key: string): boolean {
    // E key works for both layouts
    return key === 'e' || key === 'E';
  }

  private isBackwardKey(key: string): boolean {
    // Only return true if layout is already detected
    if (!this.keyboardDetected) return false;
    
    // Q for QWERTY, A for AZERTY (since Q is where A is on AZERTY)
    if (this.keyboardLayout === 'azerty') {
      return key === 'a' || key === 'A';
    } else {
      return key === 'q' || key === 'Q';
    }
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
    console.log("Starting Engine...");
    while (true) {
      try {
        await this.runGameLoop();
      } catch (err) {
        if (err instanceof VNInterruptError) {
          console.warn("VN event interrupted, returning to menu or resetting.");
        } else {
          console.error("Engine error:", err);
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      }
      while (this.engineState.state !== "RUNNING") {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  async runGameLoop(): Promise<void> {
    console.log("Starting Game engine...", this.engineState.state);
    while (this.engineState.state === "RUNNING") {
      const { immediateEvent, drawableEvents } = await this.getEvents();
      console.debug(
        `getEvents returned: immediateEvent=${immediateEvent ? immediateEvent.id : "none"}, drawableEvents=${drawableEvents.length}`,
      );
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

  findEventById(eventId: string): VNEvent | null {
    for (const location in this.eventCache) {
      const cache = this.eventCache[location];
      for (const list of ["unlocked", "locked", "notReady"] as const) {
        const found = cache[list].find((ev) => ev.id === eventId);
        if (found) {
          return found;
        }
      }
    }
    console.warn(`Event with id '${eventId}' not found`);
    return null;
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
   * Create simulation API that works on state copies and captures full snapshots
   */
  private createSimulationAPI(actions: VNAction[], gameStateCopy: any, engineStateCopy: any): EngineAPIForEvents {
    return {
      async showText(text: string, from?: string): Promise<void> {
        // Update the engine state copy immediately
        engineStateCopy.dialogue = { text, from: from || 'Narrator' };
        
        // Create action with complete state snapshot
        actions.push({
          type: 'showText',
          gameStateCopy: JSON.parse(JSON.stringify(gameStateCopy)),
          engineStateCopy: JSON.parse(JSON.stringify(engineStateCopy))
        });
        
        console.debug(`SIMULATION: showText captured state snapshot`);
      },

      async setBackground(imagePath: string): Promise<void> {
        // IMMEDIATE - no action created, just update copy
        engineStateCopy.background = imagePath;
        console.debug(`SIMULATION: setBackground immediate - ${imagePath}`);
      },

      async setForeground(imagePath: string): Promise<void> {
        // IMMEDIATE - no action created, just update copy  
        engineStateCopy.foreground = imagePath;
        console.debug(`SIMULATION: setForeground immediate - ${imagePath}`);
      },

      async showChoices(choices: Array<Choice>): Promise<string> {
        // Update engine state copy
        engineStateCopy.choices = choices;
        
        // Create action with state snapshot
        actions.push({
          type: 'showChoices',
          choices,
          gameStateCopy: JSON.parse(JSON.stringify(gameStateCopy)),
          engineStateCopy: JSON.parse(JSON.stringify(engineStateCopy))
        });
        
        // Use historical choice if replaying, otherwise first choice for simulation
        const choiceId = this.getHistoricalChoice() || choices[0].id;
        const choice = choices.find(c => c.id === choiceId);
        
        if (choice?.jump_id) {
          // Create jump action
          actions.push({
            type: 'jump',
            eventId: choice.jump_id,
            gameStateCopy: JSON.parse(JSON.stringify(gameStateCopy)),
            engineStateCopy: JSON.parse(JSON.stringify(engineStateCopy))
          });
          throw new EngineErrors.JumpInterrupt(choice.jump_id);
        }
        
        return choiceId;
      },

      async jump(eventId: string): Promise<void> {
        actions.push({
          type: 'jump',
          eventId,
          gameStateCopy: JSON.parse(JSON.stringify(gameStateCopy)),
          engineStateCopy: JSON.parse(JSON.stringify(engineStateCopy))
        });
        throw new EngineErrors.JumpInterrupt(eventId);
      },

      async runCustomLogic(logicId: string, args: any): Promise<any> {
        // Create action for custom logic (will be executed during navigation)
        actions.push({
          type: 'runCustomLogic',
          logicId,
          args,
          gameStateCopy: JSON.parse(JSON.stringify(gameStateCopy)),
          engineStateCopy: JSON.parse(JSON.stringify(engineStateCopy))
        });
        
        // Return placeholder result for simulation
        console.debug(`SIMULATION: runCustomLogic placeholder - ${logicId}`);
        return { placeholder: true, logicId };
      }
    };
  }

  createEventsCopy(): void {
    EngineEvents.createEventsCopy(this);
  }

  async getEvents(): Promise<{
    immediateEvent: VNEvent | null;
    drawableEvents: VNEvent[];
  }> {
    return await EngineEvents.getEvents(this);
  }

  updateEvents(location?: string): void {
    EngineEvents.updateEvents(this, location);
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

    console.debug("Going back in history...");
    
    // Get the last action from history (this is what we want to undo)
    const lastEntry = this.historyState.moveToHistory(); // Remove from history
    if (lastEntry) {
      // Move this action to future (so we can redo it later)
      this.historyState.moveToFuture(lastEntry);
      
      // Restore state to BEFORE this action was executed
      Object.assign(this.gameState, lastEntry.gameStateBefore);
      Object.assign(this.engineState, lastEntry.engineStateBefore);
      
      // Clear any active UI state that might conflict
      this.engineState.dialogue = null;
      this.engineState.choices = null;
      this.engineState.minigame = {
        active: false,
        type: null,
        props: null
      };
      
      console.log(`GOBACK - Action: ${lastEntry.action.type}`);
      console.log(`GOBACK - HISTORY (${this.historyState.history.length}):`, JSON.parse(JSON.stringify(this.historyState.history)));
      console.log(`GOBACK - FUTURE (${this.historyState.future.length}):`, JSON.parse(JSON.stringify(this.historyState.future)));
    }
  }

  /**
   * Main navigation method - go forward to next action and wait for user input
   */
  async goForward(): Promise<void> {
    // Check if we're going forward in history (redo) vs normal navigation
    if (this.historyState.canGoForward()) {
      console.log("GOFORWARD: Restoring from future (redo)");
      
      // Get the next entry from future stack
      const nextEntry = this.historyState.moveToHistoryFromFuture();
      if (nextEntry) {
        this.historyState.addBackToHistory(nextEntry);
        this.applyActionToEngine(nextEntry.action);
        console.log(`GOFORWARD REDO - Action: ${nextEntry.action.type}`);
        console.log(`GOFORWARD REDO - HISTORY (${this.historyState.history.length}):`, JSON.parse(JSON.stringify(this.historyState.history)));
        console.log(`GOFORWARD REDO - FUTURE (${this.historyState.future.length}):`, JSON.parse(JSON.stringify(this.historyState.future)));
      }
      
      // Wait for next user input unless skip mode
      if (!this.skipMode) {
        await this.waitForNavigation();
      }
      return;
    }
    
    // Normal forward navigation - move action from future to history
    if (this.historyState.future.length === 0) {
      console.log("GOFORWARD: End of actions reached - no more future actions");
      return;
    }
    
    // Get next action from future
    const nextAction = this.historyState.moveToHistoryFromFuture();
    if (!nextAction) {
      console.log("GOFORWARD: No action retrieved from future");
      return;
    }
    
    console.log(`GOFORWARD NORMAL - Action: ${nextAction.type}`);
    
    // Apply the action's pre-calculated state snapshot
    this.applyActionToEngine(nextAction);
    
    // Add this action to history (it contains the state snapshot)
    this.historyState.addBackToHistory(nextAction);
    
    this.engineState.currentStep++;
    
    console.log(`GOFORWARD NORMAL - HISTORY (${this.historyState.history.length}):`, JSON.parse(JSON.stringify(this.historyState.history)));
    console.log(`GOFORWARD NORMAL - FUTURE (${this.historyState.future.length}):`, JSON.parse(JSON.stringify(this.historyState.future)));
    
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
    if (action.type === 'jump') {
      // Handle jumps separately
      console.log(`APPLYING JUMP to: ${action.eventId}`);
      throw new EngineErrors.JumpInterrupt(action.eventId);
    }
    
    if (action.gameStateCopy && action.engineStateCopy) {
      // Restore complete state snapshots from simulation
      Object.assign(this.gameState, action.gameStateCopy);
      Object.assign(this.engineState, action.engineStateCopy);
      
      console.debug(`APPLIED STATE SNAPSHOT for ${action.type}`);
      console.debug(`- Game state restored`);
      console.debug(`- Engine state restored (dialogue, background, foreground, etc.)`);
    } else {
      console.warn(`Action ${action.type} missing state snapshots - old format?`);
    }
  }

  /**
   * Wait for user navigation input (the main await in dual-phase engine)
   */
  private async waitForNavigation(): Promise<void> {
    console.debug("WAITING FOR NAVIGATION INPUT...");
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
      console.debug("No navigation awaiter to resolve");
    }
  }
}

export default Engine;
