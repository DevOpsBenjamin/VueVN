import type { VNAction, GameState, EngineState } from '@/generate/types';
import { mapActions } from 'pinia';

export default class HistoryManager {
  private history: VNAction[] = [];
  private present: VNAction | null = null;
  private future: VNAction[] = [];
  private readonly maxHistorySize = 50;

  constructor() {
    console.debug('HistoryManager initialized');
  }
    
  setFuture(actions: VNAction[]): void {
    this.future = actions;
  }
  
  resetHistory(): void {
    console.debug('Resetting history');
    this.history = [];
    this.present = null;
    this.future = [];
  }

  canGoBack(): boolean {
    return this.history.length > 0;
  }

  canGoForward(): boolean {
    return this.future.length > 0;
  }

  // New methods for ActionExecutor
  getPresent(): VNAction | null {
    return this.present || null;
  }

  goBack(): VNAction | null {
    const entry = this.history.pop();
    if (entry) {
      if (this.present != null)
      {
        this.future.unshift(this.present);
      }
      this.present = entry;
    }
    return entry || null;
  }

  goForward(): VNAction | null {
    const entry = this.future.shift(); // Take FIRST item, not last
    if (entry) {      
      if (this.present != null)
      {
        this.history.push(this.present);
      }
      this.present = entry;
    }
    return entry || null;
  }

  getHistoryLength(): number {
    return this.history.length;
  }

  getFutureLength(): number {
    return this.future.length;
  }

  getLastHistoryEntry(): VNAction | null {
    if (this.history.length === 0) return null;
    return this.history[this.history.length - 1];
  }

  // Methods for save/load functionality
  getHistoryData(): { history: VNAction[], future: VNAction[] } {
    return {
      history: JSON.parse(JSON.stringify(this.history)),
      future: JSON.parse(JSON.stringify(this.future))
    };
  }

  loadHistoryData(data: { history: VNAction[], future: VNAction[] }): void {
    this.history = data.history || [];
    this.future = data.future || [];
  }
}