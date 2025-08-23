// Sample project GameState override
export interface GameState {
  player: { 
    name: string;
    level: number;
    experience: number;
  };
  location: string;
  inventory: string[];
  questFlags: Record<string, boolean>;
  flags: Record<string, any>;
  [key: string]: any;
}