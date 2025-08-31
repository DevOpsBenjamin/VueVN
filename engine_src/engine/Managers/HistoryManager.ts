import type { HistoryData, Action } from '@generate/types';

export default class HistoryManager {
  private data:HistoryData;
  private readonly maxHistorySize = 20;

  constructor() {
    this.data = {      
      history: [],
      present: null,
      future: []
    }
    console.debug('HistoryManager initialized');
  }
    
  setFuture(actions: Action[]): void {
    this.data.future = actions;
  }
  
  resetHistory(): void {
    console.debug('Resetting history');
    this.data = {      
      history: [],
      present: null,
      future: []
    }
  }

  canGoBack(): boolean {
    return this.data.history.length > 0;
  }

  canGoForward(): boolean {
    return this.data.future.length > 0;
  }

  // New methods for ActionExecutor
  getPresent(): Action | null {
    return this.data.present || null;
  }

  goBack(): void {
    const entry = this.data.history.pop();
    if (this.data.present != null)
    {
      this.data.future.unshift(this.data.present);
      this.data.present = null;
    }
    if (entry) {
      this.data.present = entry;
    }
  }

  goForward(): void {
    const entry = this.data.future.shift(); // Take FIRST item, not last     
    if (this.data.present != null)
    {
      this.data.history.push(this.data.present);
      this.data.present = null;
    }
    if (entry) { 
      this.data.present = entry;
    }
  }

  getHistoryLength(): number {
    return this.data.history.length;
  }

  getFutureLength(): number {
    return this.data.future.length;
  }

  getLastHistoryEntry(): Action | null {
    if (this.data.history.length === 0) return null;
    return this.data.history[this.data.history.length - 1];
  }

  // Methods for save/load functionality
  getHistoryData(): HistoryData {
    return this.data;
  }

  loadHistoryData(data: HistoryData): void {
    this.data = data;
  }
}
