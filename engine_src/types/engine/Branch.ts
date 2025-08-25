import type { GameState, EngineAPI } from '@generate/types';

export interface Branch {
  execute: (engine: EngineAPI, state: GameState) => Promise<void>;
}