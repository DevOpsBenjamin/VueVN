import { EngineErrors } from '@/generate/runtime';
import type { VNAction, EngineState, GameState, HistoryEntry } from '@/generate/types';
import type HistoryManager from './HistoryManager';
import type ActionExecutor from './ActionExecutor';

export default class NavigationManager {
  private engineState: EngineState;
  private gameState: GameState;
  private historyManager: HistoryManager;
  private actionExecutor: ActionExecutor;
  
  // Waiter state for smart navigation
  private continueWaiter: ((value: void) => void) | null = null;
  private choiceWaiter: ((value: string) => void) | null = null;

  constructor(
    engineState: EngineState, 
    gameState: GameState, 
    historyManager: HistoryManager,
    actionExecutor: ActionExecutor
  ) {
    this.engineState = engineState;
    this.gameState = gameState;
    this.historyManager = historyManager;
    this.actionExecutor = actionExecutor;
  }

  async goBack(): Promise<void> {
    if (!this.historyManager.canGoBack()) {
      console.warn("No history to go back to");
      return;
    }

    // Cancel any pending waiters
    this.cancelWaiters();

    console.warn("Going back in history...");
    
    // Get the last action from history (this is what we want to undo)
    const lastAction = this.historyManager.goBack();
    if (lastAction) {
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
      if (this.historyManager.getHistoryLength() > 0) {
        // Get the previous action's state (this becomes our current state)
        const previousAction = this.historyManager.getLastHistoryEntry();
        if (previousAction) {
          Object.assign(this.gameState, previousAction.gameStateCopy);
          Object.assign(this.engineState, previousAction.engineStateCopy);
        }
      } else {
        // No previous action - stay in current state completely
        // Don't clear anything - we're at the first action and should see it
        console.warn("GOBACK - At first action, keeping current state intact");
      }
      
      console.warn(`GOBACK - Undid action: ${lastAction.type}`);
    }
  }

  async goForward(): Promise<void> {
    // Check if we have any actions in future to process
    if (this.historyManager.getFutureLength() === 0) {
      console.log("GOFORWARD: End of actions reached - no more future actions");
      return;
    }

    // Cancel any pending waiters before moving forward
    this.cancelWaiters();

    const nextAction = this.historyManager.goForward();
    if (!nextAction) {
      console.log("GOFORWARD: No action retrieved from future");
      return;
    }

    // Check for cross-event navigation
    const targetEventId = nextAction.event_id;
    const currentEventId = this.engineState.currentEvent;
    
    if (targetEventId && targetEventId !== currentEventId) {
      this.engineState.currentEvent = targetEventId;
    }

    // Apply the action state to engine
    try {
      this.actionExecutor.applyActionToEngine(nextAction);
    } catch (error) {
      if (error instanceof EngineErrors.JumpInterrupt) {
        throw error; // Re-throw jump interrupts
      }
      console.error("Error applying action during goForward:", error);
    }

    // Note: This old logic is now handled by ActionExecutor's executeEvent flow
    // goForward is now mainly for manual navigation, not action execution
  }

  // Smart waiting methods for ActionExecutor
  async waitForContinue(): Promise<void> {
    // If continueWaiter is null, we're in navigation mode - auto-resolve
    if (this.continueWaiter === null) {
      console.debug("NavigationManager: Auto-resolving continue (navigation mode)");
      return Promise.resolve();
    }
    
    // Normal mode - actually wait for user input
    console.debug("NavigationManager: Waiting for user continue");
    return new Promise<void>((resolve) => {
      this.continueWaiter = resolve;
    });
  }

  async waitForChoice(): Promise<string> {
    // Choice always waits, but sets choiceWaiter state
    console.debug("NavigationManager: Waiting for user choice");
    return new Promise<string>((resolve) => {
      this.choiceWaiter = resolve;
      // Clear continueWaiter when we start waiting for choice
      this.continueWaiter = null;
    });
  }

  // Methods to resolve waiters (called by user input handlers)
  resolveContinue(): void {
    if (this.continueWaiter) {
      console.debug("NavigationManager: Resolving continue");
      this.continueWaiter();
      this.continueWaiter = null;
    }
  }

  resolveChoice(choiceId: string): void {
    if (this.choiceWaiter) {
      console.debug(`NavigationManager: Resolving choice with: ${choiceId}`);
      this.choiceWaiter(choiceId);
      this.choiceWaiter = null;
    }
  }

  // Cancel waiters for navigation
  cancelWaiters(): void {
    console.debug("NavigationManager: Cancelling all waiters");
    this.continueWaiter = null;
    this.choiceWaiter = null;
  }
}