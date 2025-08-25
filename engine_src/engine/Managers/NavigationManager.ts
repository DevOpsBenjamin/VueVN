import { HistoryManager, NavigationCancelledError, ActionError, WaitManager } from '@generate/engine';

export default class NavigationManager {
  private historyManager: HistoryManager;

  // Public wait managers - use directly when needed
  continueManager = new WaitManager<void>('Continue', NavigationCancelledError);
  choiceManager = new WaitManager<string>('Choice', NavigationCancelledError);
  actionManager = new WaitManager<void>('Action', ActionError);

  constructor(
    historyManager: HistoryManager
  ) {
    this.historyManager = historyManager;
  }

  // #region Navigation methode
  async goForward(): Promise<void> {
    if (this.continueManager.hasWaiter()) {
      console.warn("Going forward ...");
      this.historyManager.goForward();
      this.continueManager.resolve();
    }
    else if (this.choiceManager.hasWaiter() && this.historyManager.canGoForward()) {
      //Case of choice already shown and history having a previous done choice
      this.historyManager.goForward();
      this.choiceManager.reject();
    }
    else {      
      this.continueManager.reject();
      this.choiceManager.reject();
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
    this.continueManager.reject();
    this.choiceManager.reject();
  }
  // #endregion

  //Reject all for Load NewGame
  rejectWaiters() {
    this.continueManager.reject();
    this.choiceManager.reject();
    this.actionManager.reject();
  }
}