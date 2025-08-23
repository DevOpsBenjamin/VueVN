import type { Choice, CustomArgs } from '@/generate/types';

export interface EngineAPI {
  // WAIT USER INPUT
  showText: (text: string, from?: string) => Promise<void>;
  // WAIT USER CHOICE
  showChoices: (choices: Array<Choice>) => Promise<void>;
  // HANDLE INTERNALLY
  runCustom: (args: CustomArgs) => Promise<void>;
  // STOP CURRENT EVENT AND JUMP TO NEW ONE
  jump: (eventId: string) => Promise<void>;
  //NonWaiting
  setBackground: (imagePath: string) => void;
  setForeground: (imagePath: string) => void;
}