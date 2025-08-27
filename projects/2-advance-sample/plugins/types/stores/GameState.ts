import type { Player, Mother, Neighbor, Barista, GameTime } from '@generate/types';
// Sample project specific GameState
export interface GameState {
  player: Player;
  //Some typed NPC
  neighbor: Neighbor;
  mother: Mother;
  barista: Barista;
  //GameInfo
  location_id: string;
  gameTime: GameTime;
  //Flags
  flags: Record<string, boolean>;
}