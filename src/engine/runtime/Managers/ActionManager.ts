import type { GameState, Action } from '@/generate/types';
import * as actions from '@/generate/actions';

export default class ActionManager {
  private actionDico: Record<string, Action> = {};
  private accessibleActions: Action[] = [];
  private updateCallback: (() => void) | null = null;
  
  constructor() {
    this.buildActionsRecords();
  }

  buildActionsRecords() {
    this.actionDico = {};
    for (const actionName in actions) {
      try {
        const current = (actions as any)[actionName] as Action;
        this.actionDico[current.id] = current;
      }
      catch (e) {
        console.warn(`Invalid location: ${location}`, e);
      }
    }
  }

  updateAccessibleActions(gameState: GameState): void {
    this.accessibleActions = Object.values(this.actionDico).filter(action => action.unlocked(gameState));
    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  setUpdateCallback(callback: () => void): void {
    this.updateCallback = callback;
  }

  getAccessibleActions(): Action[] {
    return this.accessibleActions;
  }
  
  executeAction(actionId: string, gameState: GameState): void {
    const action = this.actionDico[actionId];
    
    if (!action) {
      throw new Error(`[ActionManager] Unknown action id: "${actionId}"`);
    }
    
    if (!action.unlocked(gameState)) {
      throw new Error(`[ActionManager] Action "${actionId}" is not available`);
    }
    
    console.log(`[ActionManager] Executing action: ${action.name}`);
    action.execute(gameState);
  }
}