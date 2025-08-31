export default class WaitManager<T> {
  private resolveFunction: ((value: T) => void) | null = null;
  private rejectFunction: ((reason: Error) => void) | null = null;
  private readonly name: string;
  private readonly errorClass: new () => Error;
  private skipMode = false;

  constructor(name: string, errorClass: new () => Error) {
    this.name = name;
    this.errorClass = errorClass;
  }

  async wait(): Promise<T> {    
    this.reject(); // Cancel any existing waiter
    
    // If skip mode is active, resolve immediately
    if (this.skipMode) {
      return Promise.resolve() as Promise<T>;
    }
    
    return new Promise<T>((resolve, reject) => {
      this.resolveFunction = resolve;
      this.rejectFunction = reject;
    });
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