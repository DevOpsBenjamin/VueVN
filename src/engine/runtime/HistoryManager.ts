import type { VNAction, GameState, EngineState } from '@/generate/types';
import { mapActions } from 'pinia';

export default class HistoryManager {
  private history: VNAction[] = [];
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
    this.future = [];
  }

  addToHistory(entry: VNAction): void {
    // Clear future when new action taken (no more go-forward)
    this.future = [];
    
    this.history.push(entry);
    
    // Limit history size for performance (50 entries max)
    if (this.history.length > this.maxHistorySize) {
      this.history.shift(); // Remove oldest
    }
  }

  canGoBack(): boolean {
    return this.history.length > 0;
  }

  canGoForward(): boolean {
    return this.future.length > 0;
  }

  goBack(): VNAction | null {
    const entry = this.history.pop();
    if (entry) {
      this.future.unshift(entry); // Add to BEGINNING of future (first to be retrieved)
    }
    return entry || null;
  }

  goForward(): VNAction | null {
    const entry = this.future.shift(); // Take FIRST item, not last
    if (entry) {
      this.history.push(entry);
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