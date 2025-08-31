import type { Choice, CustomArgs } from '@generate/types';
import type { Text } from '@generate/types';

export interface EngineAPI {
  // WAIT USER INPUT
  showText: (text: string | Text, from?: string) => Promise<void>;
  // WAIT USER CHOICE  
  showChoices: (choices: Array<Choice | { text: string | Text; branch: string }>) => Promise<void>;
  // CUSTOM ACTIONS - Extensible system for custom functionality
  runCustom: (args: CustomArgs) => Promise<any>;
  // STOP CURRENT EVENT AND JUMP TO NEW ONE
  jump: (eventId: string) => Promise<void>;
  // Foreground layer management (non-waiting)
  setForeground: (imagePaths: string[]) => void;
  addForeground: (imagePath: string) => void;
  replaceForeground: (imagePath: string) => void;
}