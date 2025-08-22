// No direct Engine import to avoid circular dependency

export interface Dialogue {
  from: string;
  text: string;
}

export interface Choice {
  text: string;
  id: string;
  branch?: string;
  jump_id?: string;
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
  minigame: {
    active: boolean;
    type: string | null;
    props: any;
  } | null;
  initialized: boolean;
  state: string;
  currentEvent: string | null;
  currentStep: number;
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

export interface EngineAPIForEvents {
  showText: (text: string, from?: string) => Promise<void>;
  setBackground: (imagePath: string) => Promise<void>;
  setForeground: (imagePath: string) => Promise<void>;
  showChoices: (choices: Array<Choice>) => Promise<string>;
  jump: (eventId: string) => Promise<void>;
  runCustomLogic: (logicId: string, args: any) => Promise<any>;
}

export interface VNEvent {
  id: string;
  name: string;
  conditions?: (state: GameState) => boolean;
  unlocked?: (state: GameState) => boolean;
  locked?: (state: GameState) => boolean;
  draw?: (engine: any, state: GameState) => void;
  execute: (engine: EngineAPIForEvents, state: GameState) => Promise<void>;
}
