import type { GameState, Action } from '@/generate/types';
import * as actions from '@/generate/actions';

export default class ActionManager {
    private actions: Action[];

    constructor() {
        this.actions = this.initializeActions();
    }

    private initializeActions(): Action[] {
        return [
        ];
    }

    getAccessibleActions(gameState: GameState): Action[] {
        return this.actions.filter(action => action.unlocked(gameState));
    }

    executeAction(actionId: string, gameState: GameState): void {
        const action = this.actions.find(a => a.id === actionId);
        
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