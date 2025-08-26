import type { NPC, GameTime } from '@generate/types';
// Sample project specific GameState
export interface GameState {
  player: NPC;
  //Some typed NPC
  neighbor: NPC;
  mother: NPC;
  //GameInfo
  location_id: string;
  gameTime: GameTime;
  //Flags
  flags: Record<string, boolean>;
}