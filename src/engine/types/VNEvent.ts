import type { GameState, EngineAPI, Branch } from '@/generate/types';

export default interface VNEvent {
  id: string;
  name: string;
  conditions: (state: GameState) => boolean;
  unlocked: (state: GameState) => boolean;
  locked: (state: GameState) => boolean;
  draw?: (engine: EngineAPI, state: GameState) => void;
  execute: (engine: EngineAPI, state: GameState) => Promise<void>;
  branches?: Record<string, Branch>;
}