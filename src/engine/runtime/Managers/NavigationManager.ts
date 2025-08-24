import type { EngineState, GameState } from '@/generate/types';
import { HistoryManager, NavigationCancelledError, ActionError } from '@/generate/runtime';
  
type Waiter<T> = {
  resolve: (value: T) => void;
  reject: (reason: NavigationCancelledError) => void;
};

export default class NavigationManager {
  private engineState: EngineState;
  private gameState: GameState;
  private historyManager: HistoryManager;

  constructor(
    engineState: EngineState, 
    gameState: GameState, 
    historyManager: HistoryManager
  ) {
    this.engineState = engineState;
    this.gameState = gameState;
    this.historyManager = historyManager;
  }

  // #region Navigation methode
  async goForward(): Promise<void> {
    if (this.continueWaiter) {
      console.warn("Going forward ...");
      this.historyManager.goForward();
      this.resolveContinue();
    }
    else if (this.choiceWaiter && this.historyManager.canGoForward()) {
      //Case of choice already shown and history having a previous done choice
      this.historyManager.goForward();
      this.rejectChoiceWaiter();
    }
    else {      
      this.rejectContinueWaiter();
      this.rejectChoiceWaiter();
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
    this.rejectContinueWaiter();
    this.rejectChoiceWaiter();
  }
  // #endregion



  // #region Continue
  private continueWaiter: Waiter<void> | null = null;

  // Smart waiting methods for ActionExecutor
  async waitForContinue(): Promise<void> {
    //REJECT IF EXISTE
    this.rejectContinueWaiter();
    
    // Normal mode - actually wait for user input
    console.warn("waitForContinue");
    return new Promise<void>((resolve, reject) => {
      this.continueWaiter = { resolve, reject };
    });
  }
  
  rejectContinueWaiter() {
    if (this.continueWaiter) {
      this.continueWaiter.reject(new NavigationCancelledError());
      this.continueWaiter = null;
    }
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
  // #endregion
  
  // #region Choice
  private choiceWaiter: Waiter<string> | null = null;

  async waitForChoice(): Promise<string> {
    //REJECT IF EXISTE
    this.rejectChoiceWaiter();
    
    // Choice always waits, but sets choiceWaiter state
    console.warn("waitForChoice");
    return new Promise<string>((resolve, reject) => {
      this.choiceWaiter = { resolve, reject };
    });
  }

  rejectChoiceWaiter() {
    if (this.choiceWaiter) {
      this.choiceWaiter.reject(new NavigationCancelledError());
      this.choiceWaiter = null;
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
  // #endregion

  // #region Action
  private actionWaiter: Waiter<void> | null = null; 

  //For LessLooping
  async waitAction(): Promise<void> {
    this.rejectActionWaiter();
    
    // Wait for user input (can be action/location change/drawable event click)
    console.warn("waitAction");
    return new Promise<void>((resolve, reject) => {
      this.actionWaiter = { resolve, reject };
    });
  }

  rejectActionWaiter() {
    if (this.actionWaiter) {
      this.actionWaiter.reject(new ActionError());
      this.actionWaiter = null;
    }
  }
  
  resolveAction(): void {
    if (this.actionWaiter) {
      console.warn("NavigationManager: Resolving action");
      this.actionWaiter.resolve();
      this.actionWaiter = null;
    }
    else {
      console.error('resolveAction without waiter')
    }
  }
  // #endregion
}