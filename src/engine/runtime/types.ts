import type Engine from "./Engine";

export interface Dialogue {
  from: string;
  text: string;
}

export interface EngineState {
  background: string | null;
  foreground: string | null;
  dialogue: Dialogue | null;
  choices?: Array<{ text: string; id: string }> | null;
  initialized: boolean;
  state: string;
  currentEvent: string | null;
  currentStep: number;
  resetState: () => void;
}

export interface GameState {
  player: { name: string };
  location: string;
  flags: Record<string, any>;
  [key: string]: any;
}

export interface VNEvent {
  id: string;
  name: string;
  conditions?: (state: GameState) => boolean;
  unlocked?: (state: GameState) => boolean;
  locked?: (state: GameState) => boolean;
  draw?: (engine: Engine, state: GameState) => void;
  execute: (engine: Engine, state: GameState) => Promise<void>;
}

export interface Location {
  id: string;
  name: string;
  background: string;
  [key: string]: any;
}

export interface NPC {
  name: string;
  flags: Record<string, any>;
  [key: string]: any;
}

export type VNStore = Record<string, any>;
