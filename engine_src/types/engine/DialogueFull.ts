import type { Text } from '@generate/types';

export interface DialogueFull {
  from?: string;
  text: Text;
  variables?: Record<string, any>;
}