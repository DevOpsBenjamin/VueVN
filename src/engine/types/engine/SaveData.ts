import type { EngineState, GameState, HistoryData } from '@/generate/types';

export interface SaveData {
    name: string;
    timestamp: string;
    gameState: GameState;
    engineState: EngineState;
    historyState: HistoryData;
}