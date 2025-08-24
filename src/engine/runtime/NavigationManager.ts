import { EngineErrors } from '@/generate/runtime';
import type { VNAction, EngineState, GameState } from '@/generate/types';
import type HistoryManager from './HistoryManager';
import type ActionExecutor from './ActionExecutor';

export default class NavigationManager {
  private engineState: EngineState;
  private gameState: GameState;
  private historyManager: HistoryManager;
  
  // Waiter state for smart navigation
  private continueWaiter: ((value: void) => void) | null = null;
  private choiceWaiter: ((value: string) => void) | null = null;

  constructor(
    engineState: EngineState, 
    gameState: GameState, 
    historyManager: HistoryManager
  ) {
    this.engineState = engineState;
    this.gameState = gameState;
    this.historyManager = historyManager;
  }

  async goBack(): Promise<void> {
    if (!this.historyManager.canGoBack()) {
       console.warn("Can't goBack..."); 
      return;
    }
    console.warn("Going back in history...");    
    // Get the last action from history (this is what we want to undo)
    this.historyManager.goBack();
    const action = this.historyManager.getPresent();
    if (action && action.gameState && action.engineState) {
      Object.assign(this.gameState, JSON.parse(JSON.stringify(action.gameState)));
      Object.assign(this.engineState, JSON.parse(JSON.stringify(action.engineState)));
    }
  }

  async goForward(): Promise<void> {
    if (this.continueWaiter) {
      console.warn("Going forward ...");
      this.resolveContinue();
    }
    else {
      if (!this.historyManager.canGoForward()) {
          console.warn("Can't goForward..."); 
        return;
      }
      this.historyManager.goForward();
      const action = this.historyManager.getPresent();
      if (action && action.gameState && action.engineState) {
        Object.assign(this.gameState, JSON.parse(JSON.stringify(action.gameState)));
        Object.assign(this.engineState, JSON.parse(JSON.stringify(action.engineState)));
      }
    }
  }

  async makeChoice(choiceId: string): Promise<void> {
    this.resolveChoice(choiceId);
  }

  // Smart waiting methods for ActionExecutor
  async waitForContinue(): Promise<void> {
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
    });
  }

  // Methods to resolve waiters (called by user input handlers)
  resolveContinue(): void {
    if (this.continueWaiter) {
      console.warn("NavigationManager: Resolving continue");
      this.continueWaiter();
      this.continueWaiter = null;
    }
  }

  resolveChoice(choiceId: string): void {
    console.log('resolveChoice')
    if (this.choiceWaiter) {
      console.warn(`NavigationManager: Resolving choice with: ${choiceId}`);
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