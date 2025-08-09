export interface GameState {
  player: { name: string };
  location: string;
  flags: Record<string, any>;
  [key: string]: any;
}

export interface Engine {}

export interface VNEvent {
  id: string;
  name: string;
  conditions?: (state: GameState) => boolean;
  unlocked?: (state: GameState) => boolean;
  locked?: (state: GameState) => boolean;
  draw?: (engine: Engine, state: GameState) => void;
  execute: (engine: Engine, state: GameState) => Promise<void>;
}

export declare function createEvent(event: VNEvent): VNEvent;
