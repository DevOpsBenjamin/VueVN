import type { Neighbor_NPC, Player } from '@/generate/types';

// Sample project specific GameState
export interface GameState {
  player: Player;
  location: string;
  flags: Record<string, boolean>;
  // Sample project specific properties (matching gameState.ts store)
  neighbor: Neighbor_NPC;
  myCustomField: string;
  myCustomArray: string[];
  // Minigame results (should not be in flags)
  lastMinigameResult?: any;
}