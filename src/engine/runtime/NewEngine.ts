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
}