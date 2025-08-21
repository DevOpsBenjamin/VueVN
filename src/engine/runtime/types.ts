import type Engine from "./Engine";

export interface Dialogue {
  from: string;
  text: string;
}

export interface Choice {
  text: string;
  id: string;
  jump_id: string;
}

export interface VNAction {
  type: 'showText' | 'setBackground' | 'setForeground' | 'showChoices' | 'jump' | 'runCustomLogic';
  [key: string]: any;
}

export interface HistoryEntry {
  action: VNAction;
  gameStateBefore: GameState;
  engineStateBefore: EngineState;
  timestamp: number;
  choiceMade?: string;
  customLogicResult?: any;
}

export interface EngineState {
  background: string | null;
  foreground: string | null;
  dialogue: Dialogue | null;
  choices: Array<Choice> | null;
  initialized: boolean;
  state: string;
  currentEvent: string | null;
  currentActionIndex: number;
  history: HistoryEntry[];
  future: HistoryEntry[];
  isSimulating: boolean;
  isFastForwarding: boolean;
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
