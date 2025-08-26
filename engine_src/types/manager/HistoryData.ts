import type { VNAction, EngineState, GameState } from '@generate/types';

export interface HistoryData {
    history: VNAction[];
    present: VNAction | null;
    future: VNAction[];
}