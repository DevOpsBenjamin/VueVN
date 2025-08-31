export default class WaitManager<T> {
  private resolveFunction: ((value: T) => void) | null = null;
  private rejectFunction: ((reason: Error) => void) | null = null;
  private readonly name: string;
  private readonly errorClass: new () => Error;

  constructor(name: string, errorClass: new () => Error) {
    this.name = name;
    this.errorClass = errorClass;
  }

  async wait(): Promise<T> {    
    this.reject(); // Cancel any existing waiter
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
}