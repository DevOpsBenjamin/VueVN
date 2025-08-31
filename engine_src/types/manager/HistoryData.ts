import type { Action, EngineState, GameState } from '@generate/types';

export interface HistoryData {
    history: Action[];
    present: Action | null;
    future: Action[];
}
