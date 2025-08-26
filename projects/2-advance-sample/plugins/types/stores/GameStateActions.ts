import type { GameState } from '@generate/types';

export interface GameStateActions {
  $reset(this: GameState): void;
}