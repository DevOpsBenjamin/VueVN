import type { 
  GameState, 
  EngineState, 
  VNEvent, 
  VNAction, 
  HistoryEntry, 
  EngineAPIForEvents,
  Choice
} from "./types";
import { JumpInterrupt, VNInterruptError } from "./EngineErrors";
import { CustomLogicRegistry } from "./CustomLogicRegistry";

export class NewEngine {
  gameState: GameState;
  engineState: EngineState;
  private awaiterResult: ((value: any) => void) | null;
  private customLogicCache: Record<string, any>;

  constructor(gameState: GameState, engineState: EngineState) {
    this.gameState = gameState;
    this.engineState = engineState;
    this.awaiterResult = null;
    this.customLogicCache = {};

    // Initialize new engine state properties
    if (!this.engineState.history) {
      this.engineState.history = [];
    }
    if (!this.engineState.future) {
      this.engineState.future = [];
    }
    if (typeof this.engineState.currentActionIndex === 'undefined') {
      this.engineState.currentActionIndex = 0;
    }
    if (typeof this.engineState.isSimulating === 'undefined') {
      this.engineState.isSimulating = false;
    }
    if (typeof this.engineState.isFastForwarding === 'undefined') {
      this.engineState.isFastForwarding = false;
    }

    if (typeof window !== "undefined") {
      const w = window as any;
      if (!w.__VN_ENGINE__) {
        console.debug("Initializing New VN Engine instance");
        w.VueVN = this.gameState;
        w.__VN_ENGINE__ = this;
        this.initVNInputHandlers();
      }
    }
  }

  static getInstance(): NewEngine | undefined {
    return typeof window !== "undefined"
      ? ((window as any).__VN_ENGINE__ as NewEngine)
      : undefined;
  }

  /**
   * Initialize input handlers for VN controls
   */
  private initVNInputHandlers(): void {
    window.addEventListener('click', (e) => {
      if (this.engineState.state !== 'RUNNING') return;
      
      if (e.clientX < window.innerWidth / 2) {
        // Left side - go back
        this.goBack();
      } else {
        // Right side - continue
        this.resolveAwaiter('continue');
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.goBack();
      if (e.key === 'ArrowRight' || e.key === ' ') this.resolveAwaiter('continue');
      if (e.key === 'Escape') {
        // Handle menu toggle - placeholder for now
        console.debug('Menu toggle requested');
      }
    });
  }

  /**
   * Resolve the current awaiter to continue execution
   */
  private resolveAwaiter(result: any): void {
    if (this.awaiterResult) {
      console.debug("Resolving awaiter with result:", result);
      this.awaiterResult(result);
      this.cleanAwaiter();
    } else {
      console.debug("No awaiter to resolve");
    }
  }

  /**
   * Cancel the current awaiter
   */
  private cancelAwaiter(): void {
    if (this.awaiterResult) {
      console.debug("Cancelling awaiter");
      this.awaiterResult(Promise.reject(new VNInterruptError()));
      this.cleanAwaiter();
    } else {
      console.debug("No awaiter to cancel");
    }
  }

  /**
   * Clean up awaiter state
   */
  private cleanAwaiter(): void {
    this.awaiterResult = null;
    this.engineState.dialogue = null;
    this.engineState.choices = null;
  }

  /**
   * Go back one step in history
   */
  async goBack(): Promise<void> {
    if (this.engineState.history.length === 0) {
      console.warn("No history to go back to");
      return;
    }

    // TODO: Implement go back functionality
    console.debug("Go back requested - not yet implemented");
  }

  /**
   * Go forward one step (after going back)
   */
  async goForward(): Promise<void> {
    if (this.engineState.future.length === 0) {
      console.warn("No future to go forward to");
      return;
    }

    // TODO: Implement go forward functionality
    console.debug("Go forward requested - not yet implemented");
  }

  /**
   * Create simulation API that records actions without real execution
   */
  private createSimulationAPI(actions: VNAction[]): EngineAPIForEvents {
    return {
      async showText(text: string, from?: string): Promise<void> {
        actions.push({ type: 'showText', text, from });
        // No waiting in simulation
      },

      async setBackground(imagePath: string): Promise<void> {
        actions.push({ type: 'setBackground', imagePath });
      },

      async setForeground(imagePath: string): Promise<void> {
        actions.push({ type: 'setForeground', imagePath });
      },

      async showChoices(choices: Array<Choice>): Promise<string> {
        actions.push({ type: 'showChoices', choices });
        
        // Use historical choice if replaying, otherwise first choice
        const choiceId = this.getHistoricalChoice() || choices[0].id;
        const choice = choices.find(c => c.id === choiceId);
        
        if (choice?.jump_id) {
          actions.push({ type: 'jump', eventId: choice.jump_id });
          throw new JumpInterrupt(choice.jump_id);
        }
        
        return choiceId;
      },

      async jump(eventId: string): Promise<void> {
        actions.push({ type: 'jump', eventId });
        throw new JumpInterrupt(eventId);
      },

      async runCustomLogic(logicId: string, args: any): Promise<any> {
        actions.push({ type: 'runCustomLogic', logicId, args });
        // Custom logic exits event flow
        throw new JumpInterrupt('EXIT_EVENT');
      }
    };
  }

  /**
   * Get historical choice for replay (placeholder)
   */
  private getHistoricalChoice(): string | null {
    // TODO: Implement historical choice lookup
    return null;
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
        throw new JumpInterrupt(action.eventId);
        break;

      case 'runCustomLogic':
        const result = await this.executeCustomLogic(action.logicId, action.args);
        this.cacheCustomLogicResult(action.logicId, result);
        // Custom logic exits event flow
        throw new JumpInterrupt('EXIT_EVENT');
        break;

      default:
        console.warn(`Unknown action type: ${(action as any).type}`);
    }
  }

  /**
   * Wait for user to continue (right click or space)
   */
  private async waitForContinue(): Promise<void> {
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
   * Record choice in history (placeholder)
   */
  private recordChoiceInHistory(choiceId: string): void {
    // TODO: Record choice in last history entry
    console.debug(`Choice made: ${choiceId}`);
  }

  /**
   * Jump to a new event (placeholder)
   */
  private jumpToEvent(eventId: string): void {
    // TODO: Set up jump to new event
    this.engineState.currentEvent = eventId;
    this.engineState.currentActionIndex = 0;
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

    // Execute custom logic - this exits event context
    const result = await logicFunction(args, this.gameState);
    return result;
  }

  /**
   * Cache custom logic result for history navigation
   */
  private cacheCustomLogicResult(logicId: string, result: any): void {
    this.customLogicCache[logicId] = result;
  }

  /**
   * Main event processor using dual-phase execution
   */
  async processEvent(event: VNEvent): Promise<void> {
    console.debug(`Processing event: ${event.id}`);
    
    try {
      // Phase 1: Simulation - generate action sequence
      const actionSequence = await this.simulateEvent(event);
      
      // Phase 2: Playback - execute actions with real user interaction
      await this.playbackActions(actionSequence);
      
      // Event completed successfully
      this.engineState.currentEvent = null;
      this.engineState.currentActionIndex = 0;
      console.debug(`Event ${event.id} completed`);
      
    } catch (error) {
      if (error instanceof JumpInterrupt) {
        console.debug(`Event ${event.id} interrupted by jump to ${error.targetEventId}`);
        // Jump handling will be done by main game loop
      } else {
        console.error(`Error processing event ${event.id}:`, error);
        throw error;
      }
    }
  }

  /**
   * Phase 1: Simulate event execution to generate action sequence
   */
  private async simulateEvent(event: VNEvent): Promise<VNAction[]> {
    const actions: VNAction[] = [];
    this.engineState.isSimulating = true;
    
    console.debug(`Simulating event: ${event.id}`);
    
    try {
      const simulationAPI = this.createSimulationAPI(actions);
      await event.execute(simulationAPI, this.gameState);
    } catch (jumpInterrupt) {
      // Expected for choices and custom logic - simulation ends here
      console.debug(`Simulation ended with jump interrupt`);
    } finally {
      this.engineState.isSimulating = false;
    }
    
    console.debug(`Generated ${actions.length} actions from simulation`);
    return actions;
  }

  /**
   * Phase 2: Execute actions with real user interaction
   */
  private async playbackActions(actions: VNAction[]): Promise<void> {
    console.debug(`Playing back ${actions.length} actions`);
    
    for (let i = this.engineState.currentActionIndex; i < actions.length; i++) {
      const action = actions[i];
      
      // Record state before action for history
      this.recordHistory(action);
      
      // Execute action with real user interaction
      await this.executeAction(action);
      
      this.engineState.currentActionIndex = i + 1;
    }
  }

  /**
   * Record current state and action in history
   */
  private recordHistory(action: VNAction): void {
    // Clear future when new action taken (no more go-forward)
    this.engineState.future = [];
    
    // Create snapshot of current state
    const entry: HistoryEntry = {
      action,
      gameStateBefore: JSON.parse(JSON.stringify(this.gameState)),
      engineStateBefore: JSON.parse(JSON.stringify(this.engineState)),
      timestamp: Date.now()
    };
    
    this.engineState.history.push(entry);
    
    // Limit history size for performance (50 entries max)
    if (this.engineState.history.length > 50) {
      this.engineState.history.shift(); // Remove oldest
    }
  }
}