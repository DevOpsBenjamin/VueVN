import type { GameState, EngineAPI } from '@/generate/types';

export default interface Branch {
  execute: (engine: EngineAPI, state: GameState) => Promise<void>;
}