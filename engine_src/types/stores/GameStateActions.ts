import type { GameState } from '@generate/types';

export interface GameStateActions {
  resetGame(this: GameState): void;
}