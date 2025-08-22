import type { Choice, CustomArgs } from '@/generate/types';

export default interface EngineAPI {
  showText: (text: string, from?: string) => Promise<void>;
  showChoices: (choices: Array<Choice>) => Promise<void>;
  runCustom: (args: CustomArgs) => Promise<void>;
  jump: (eventId: string) => Promise<void>;
  //NonWaiting
  setBackground: (imagePath: string) => void;
  setForeground: (imagePath: string) => void;
}