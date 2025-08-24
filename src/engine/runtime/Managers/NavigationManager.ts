import type { EngineState, GameState } from '@/generate/types';
import { HistoryManager, NavigationCancelledError } from '@/generate/runtime';
  
type Waiter<T> = {
  resolve: (value: T) => void;
  reject: (reason: NavigationCancelledError) => void;
};

export default class NavigationManager {
  private engineState: EngineState;
  private gameState: GameState;
  private historyManager: HistoryManager;

  // Waiter state for smart navigation
  private continueWaiter: Waiter<void> | null = null;
  private choiceWaiter: Waiter<string> | null = null;

  constructor(
    engineState: EngineState, 
    gameState: GameState, 
    historyManager: HistoryManager
  ) {
    this.engineState = engineState;
    this.gameState = gameState;
    this.historyManager = historyManager;
  }

  rejectWaiters() {
    if (this.choiceWaiter) {
      this.choiceWaiter.reject(new NavigationCancelledError());
      this.choiceWaiter = null;
    }
    if (this.continueWaiter) {
      this.continueWaiter.reject(new NavigationCancelledError());
      this.continueWaiter = null;
    }
  }

  async goForward(): Promise<void> {
    if (this.continueWaiter) {
      console.warn("Going forward ...");
      this.historyManager.goForward();
      this.resolveContinue();
    }
    else if (this.choiceWaiter && this.historyManager.canGoForward()) {
      //Case of choice already shown and history having a previous done choice
      this.historyManager.goForward();
      this.rejectWaiters();
    }
    else {      
      this.rejectWaiters();
    }
  }

  async goBack(): Promise<void> {
    if (!this.historyManager.canGoBack()) {
      console.warn("Can't goBack..."); 
    }
    else {
      console.warn("Going back in history...");
      this.historyManager.goBack();
    }
    this.rejectWaiters();
  }

  // Smart waiting methods for ActionExecutor
  async waitForContinue(): Promise<void> {
    if (this.continueWaiter) {
      this.rejectWaiters();
    }
    // Normal mode - actually wait for user input
    console.warn("waitForContinue");
    return new Promise<void>((resolve, reject) => {
      this.continueWaiter = { resolve, reject };
    });
  }

  async waitForChoice(): Promise<string> {
    if (this.continueWaiter) {
      this.rejectWaiters();
    }
    // Choice always waits, but sets choiceWaiter state
    console.warn("waitForChoice");
    return new Promise<string>((resolve, reject) => {
      this.choiceWaiter = { resolve, reject };
    });
  }

  // Methods to resolve waiters (called by user input handlers)
  resolveContinue(): void {
    if (this.continueWaiter) {
      console.warn("NavigationManager: Resolving continue");
      this.continueWaiter.resolve();
      this.continueWaiter = null;
    }
    else {
      console.error('resolveContinue without waiter')
    }
  }

  resolveChoice(choiceId: string): void {
    if (this.choiceWaiter) {
      console.warn(`NavigationManager: Resolving choice with: ${choiceId}`);
      this.choiceWaiter.resolve(choiceId);
      this.choiceWaiter = null;
    }
    else {
      console.error('resolveChoice without waiter')
    }
  }
}