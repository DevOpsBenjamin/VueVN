import type { DialogueSimple, DialogueFull, ChoiceSimple, ChoiceFull, CustomArgs, Settings } from '@generate/types';

export interface EngineState {
  initialized: boolean;
  background: string | null;
  foreground: string[] | null;
  dialogue: DialogueSimple | DialogueFull | null;
  choices: Array<ChoiceSimple | ChoiceFull> | null;
  customArgs: CustomArgs | null;
  jumpEvent: string | null;
  state: string;
  currentEvent: string | null;
  currentStep: number;
  settings: Settings;

  //USE?
  //isSimulating: boolean;
  //isFastForwarding: boolean;
}