export default class WaitManager<T> {
  private resolveFunction: ((value: T) => void) | null = null;
  private rejectFunction: ((reason: Error) => void) | null = null;
  private readonly name: string;
  private readonly errorClass: new () => Error;
  private skipMode = false;
  private readonly onResolveCallback: (() => void) | null;

  constructor(name: string, errorClass: new () => Error, onResolveCallback: (() => void) | null = null) {
    this.name = name;
    this.errorClass = errorClass;
    this.onResolveCallback = onResolveCallback;
  }

  async wait(): Promise<T> {    
    console.debug("wait: ", this.skipMode);
    this.reject(); // Cancel any existing waiter
    
    const promise = new Promise<T>((resolve, reject) => {
      this.resolveFunction = resolve;
      this.rejectFunction = reject;
    });
    
    // If skip mode is active, resolve immediately (this will call the callback)
    if (this.skipMode) {      
      await new Promise((resolve) => setTimeout(resolve, 250));
      this.resolve(undefined as T);
    }
    
    return promise;
  }

  reject(): void {
    if (this.rejectFunction) {
      this.rejectFunction(new this.errorClass());
      this.resolveFunction = null;
      this.rejectFunction = null;
    }
  }

  resolve(value: T): void {
    if (this.resolveFunction) {
      // Call the callback if provided
      if (this.onResolveCallback) {
        console.debug("resolve: ", this.onResolveCallback);
        this.onResolveCallback();
      }
      this.resolveFunction(value);
      this.resolveFunction = null;
      this.rejectFunction = null;
    } else {
      console.error(`resolve${this.name} without waiter`);
    }
  }

  hasWaiter(): boolean {
    return this.resolveFunction !== null;
  }

  enableSkip(): void {
    this.skipMode = true;
    // Resolve any current waiter immediately
    if (this.resolveFunction) {
      this.resolve(undefined as T);
    }
  }

  disableSkip(): void {
    this.skipMode = false;
  }
}