import type { Dialogue, Choice, CustomArgs } from '@/generate/types';

export interface EngineState {
  initialized: boolean;
  background: string | null;
  foreground: string | null;
  dialogue: Dialogue | null;
  choices: Array<Choice> | null;
  customArgs: CustomArgs | null;
  jumpEvent: string | null;
  state: string;
  currentEvent: string | null;
  currentStep: number;

  //USE?
  //isSimulating: boolean;
  //isFastForwarding: boolean;
}