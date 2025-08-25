import type { GameState, Action } from '@generate/types';
import * as actions from '@generate/actions';

export default class ActionManager {
  private actionDico: Record<string, Action> = {};
  private accessibleActions: Action[] = [];
  private updateCallback: (() => void) | null = null;
  private locationManager: import('./LocationManager').default | null = null;
  
  constructor() {
    this.buildActionsRecords();
  }

  setLocationManager(locationManager: import('./LocationManager').default): void {
    this.locationManager = locationManager;
  }

  buildActionsRecords() {
    this.actionDico = {};
    for (const actionName in actions) {
      try {
        const current = (actions as any)[actionName] as Action;
        this.actionDico[current.id] = current;
      }
      catch (e) {
        console.warn(`Invalid action: ${actionName}`, e);
      }
    }
  }

  async updateAccessibleActions(gameState: GameState): Promise<void> {
    let availableActions: Action[] = [];

    // Try location-centric actions first
    if (this.locationManager) {
      try {
        const locationActions = await this.locationManager.getCurrentLocationActions(gameState.location_id);
        availableActions = locationActions.filter(action => action.unlocked(gameState));
      } catch (error) {
        console.warn('[ActionManager] Failed to load location-specific actions, falling back to global actions');
        // Fallback to global actions
        availableActions = Object.values(this.actionDico).filter(action => action.unlocked(gameState));
      }
    } else {
      // Legacy: use global actions
      availableActions = Object.values(this.actionDico).filter(action => action.unlocked(gameState));
    }

    this.accessibleActions = availableActions;
    
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