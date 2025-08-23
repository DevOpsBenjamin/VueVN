export default class WaitManager {
  private awaiterResult: ((value: any) => void) | null = null;
  private navigationAwaiter: ((value: any) => void) | null = null;
  private skipMode: boolean = false;

  setSkipMode(skip: boolean): void {
    this.skipMode = skip;
  }

  getSkipMode(): boolean {
    return this.skipMode;
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
      this.awaiterResult = null;
    } else {
      console.debug("No awaiter to cancel");
    }
  }

  cleanAwaiter(): void {
    this.awaiterResult = null;
  }

  async waitForContinue(): Promise<void> {
    // Skip mode: don't wait, continue immediately
    if (this.skipMode) {
      console.debug("Skip mode active: bypassing wait");
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve) => {
      this.awaiterResult = resolve;
    });
  }

  async waitForChoice(): Promise<string> {
    return new Promise<string>((resolve) => {
      this.awaiterResult = resolve;
    });
  }

  async waitForNavigation(): Promise<void> {
    console.warn("WAITING FOR NAVIGATION INPUT...");
    return new Promise<void>((resolve) => {
      this.navigationAwaiter = resolve;
    });
  }

  resolveNavigation(goForwardCallback: () => void): void {
    if (this.navigationAwaiter) {
      console.debug("RESOLVING NAVIGATION - calling goForward()");
      this.navigationAwaiter();
      this.navigationAwaiter = null;
      // After resolving, call goForward for next action
      goForwardCallback();
    } else {
      console.warn("No navigation awaiter to resolve");
    }
  }

  cancelNavigationAwaiter(): void {
    if (this.navigationAwaiter) {
      this.navigationAwaiter = null;
    }
  }
}