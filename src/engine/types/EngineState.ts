import type { Dialogue, Choice } from '@/generate/types';

export default interface EngineState {
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
}