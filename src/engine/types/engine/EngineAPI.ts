import type { Choice, CustomArgs } from '@/generate/types';

export interface EngineAPI {
  // WAIT USER INPUT
  showText: (text: string, from?: string) => Promise<void>;
  // WAIT USER CHOICE
  showChoices: (choices: Array<Choice>) => Promise<void>;
  // TODO HANDLE INTERNALLY // NOT READY
  // runCustom: (args: CustomArgs) => Promise<void>;
  // TODO STOP CURRENT EVENT AND JUMP TO NEW ONE //NOREADY
  // jump: (eventId: string) => Promise<void>;
  //NonWaiting
  setForeground: (imagePath: string) => void;
}