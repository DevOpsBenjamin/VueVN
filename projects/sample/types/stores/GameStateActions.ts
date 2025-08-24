import type { GameState } from './GameState';

export interface GameStateActions {
  resetGame(this: GameState): void;
}