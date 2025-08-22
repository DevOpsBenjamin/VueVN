import type { Choice } from '@/generate/types';

export default interface EngineAPIForEvents {
  showText: (text: string, from?: string) => Promise<void>;
  setBackground: (imagePath: string) => Promise<void>;
  setForeground: (imagePath: string) => Promise<void>;
  showChoices: (choices: Array<Choice>) => Promise<string>;
  jump: (eventId: string) => Promise<void>;
  runCustomLogic: (logicId: string, args: any) => Promise<any>;
}