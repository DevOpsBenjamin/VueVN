import type { GameTime } from '@/generate/types';

export interface GameState {
  player: { name: string };
  location: string;
  gameTime: GameTime;
  flags: Record<string, any>;
  [key: string]: any;
}