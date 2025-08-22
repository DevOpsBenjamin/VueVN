import type { GameState, EngineAPIForEvents } from '@/generate/types';

export default interface VNEvent {
  id: string;
  name: string;
  conditions?: (state: GameState) => boolean;
  unlocked?: (state: GameState) => boolean;
  locked?: (state: GameState) => boolean;
  draw?: (engine: any, state: GameState) => void;
  execute: (engine: EngineAPIForEvents, state: GameState) => Promise<void>;
}