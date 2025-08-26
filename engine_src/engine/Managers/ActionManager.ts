import type { GameState, Action, LocationActions } from '@generate/types';
import projectData from '@generate/project'

export default class ActionManager {
  private allActions: LocationActions = {};
  private currentActions: Record<string, Action> = {};
  private unlockedActions: Action[] = [];
  private updateCallback: (() => void) | null = null;
  
  constructor() {
    this.buildActionsRecords();
  }

  buildActionsRecords() {
    this.allActions = {};
    for (const location_id in projectData.locations) {
      try {
        this.allActions[location_id] = projectData.locations[location_id].actions;
      }
      catch (e) {
        console.warn(`Invalid action: ${location_id}`, e);
      }
    }
  }
  
  updateAccessibleActions(gameState: GameState): void {
    const localActions = this.allActions[gameState.location_id];
    const globalActions = projectData.global.actions;
    
    //Add global Action
    this.currentActions = { ...globalActions, ...localActions };
    this.unlockedActions = Object.values(localActions).filter(action => action.unlocked(gameState));
    
    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  setUpdateCallback(callback: () => void): void {
    this.updateCallback = callback;
  }

  getAccessibleActions(): Action[] {
    return this.unlockedActions;
  }
  
  executeAction(actionId: string, gameState: GameState): void {
    const action = this.currentActions[actionId];
    
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