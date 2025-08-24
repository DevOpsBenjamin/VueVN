// Sample project GameState - must match actual Pinia store structure
export interface GameState {
  player: { 
    name: string;
  };
  location: string;
  flags: Record<string, any>;
  // Sample project specific properties (matching gameState.ts store)
  npc_1: any;
  myCustomField: string;
  myCustomArray: string[];
  [key: string]: any;
}