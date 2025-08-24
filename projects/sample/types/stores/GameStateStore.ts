import type { GameState } from './GameState';
import type { GameStateActions } from './GameStateActions';

// Pinia store type that combines GameState interface + store methods + GameStateActions
export type GameStateStore = GameState & {
  // Pinia built-in methods
  $state: GameState;
  $reset: () => void;
  $patch: (partialState: Partial<GameState>) => void;
} & GameStateActions;