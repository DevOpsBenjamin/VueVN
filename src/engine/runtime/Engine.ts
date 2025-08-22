import {
  EngineEvents,
  EngineAPI,
  EngineSave,
  VNInterruptError,
} from "@/generate/runtime";
import { engineStateEnum as ENGINE_STATES } from "@/generate/stores";
import type { 
  GameState, 
  EngineState, 
  VNEvent, 
  VNAction, 
  HistoryEntry, 
  EngineAPIForEvents,
  Choice 
} from "./types";
import { JumpInterrupt } from "./EngineErrors";
import { CustomLogicRegistry } from "./CustomLogicRegistry";

class Engine {
  gameState: GameState;
  engineState: EngineState;
  awaiterResult: ((value: any) => void) | null;
  replayMode: boolean;
  targetStep: number;
  eventCache: Record<
    string,
    { notReady: VNEvent[]; unlocked: VNEvent[]; locked: VNEvent[] }
  >;
  private customLogicCache: Record<string, any>;

  constructor(gameState: GameState, engineState: EngineState) {
    this.gameState = gameState;
    this.engineState = engineState;
    this.awaiterResult = null;
    this.replayMode = false;
    this.targetStep = 0;
    this.eventCache = {};
    this.customLogicCache = {};

    // Initialize new engine state properties for dual-phase execution
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
        this.resolveAwaiter("continue");
      } else if (e.key === "ArrowLeft") {
        this.goBack();
      } else {
        console.debug(`Unhandled key: ${e.key}`);
      }
    });
    window.addEventListener("click", (e) => {
      if (e.clientX > window.innerWidth / 2) {
        if (this.engineState.state === ENGINE_STATES.RUNNING) {
          this.resolveAwaiter("continue");
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
      // Phase 1: Simulation - generate action sequence
      const actionSequence = await this.simulateEvent(immediateEvent);
      
      // Phase 2: Playback - execute actions with real user interaction
      await this.playbackActions(actionSequence);
      
      // Event completed successfully
      this.engineState.currentEvent = null;
      this.engineState.currentActionIndex = 0;
      console.debug(`Event ${immediateEvent.id} completed`);
      
    } catch (error) {
      if (error instanceof JumpInterrupt) {
        console.debug(`Event ${immediateEvent.id} interrupted by jump to ${error.targetEventId}`);
        // Jump handling will be done by main game loop
      } else {
        console.error(`Error processing event ${immediateEvent.id}:`, error);
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
}

export default Engine;
