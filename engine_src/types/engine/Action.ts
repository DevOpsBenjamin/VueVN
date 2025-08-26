import type { GameState } from '@generate/types';

export interface Action {
  id: string;
  name: string;
  unlocked: (state: GameState) => boolean; // Conditions for action to be available
  execute: (state: GameState) => void; // Function to execute the action
}