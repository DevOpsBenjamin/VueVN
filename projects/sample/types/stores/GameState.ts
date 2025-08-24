import type { Neighbor_NPC, Mother_NPC, Player, GameTime, Location } from '@/generate/types';
// Sample project specific GameState
export interface GameState {
  player: Player;
  location_id: string;
  gameTime: GameTime;
  flags: Record<string, boolean>;
  //Some typed NPC
  neighbor: Neighbor_NPC;
  mother: Mother_NPC;
}