import type { VNAction, GameState, EngineState } from '@/generate/types';

export default interface HistoryEntry {
  action: VNAction;
  gameStateBefore: GameState;
  engineStateBefore: EngineState;
  timestamp: number;
  choiceMade?: string;
  customLogicResult?: any;
}