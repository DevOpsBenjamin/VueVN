import type { Text } from '@generate/types';

export interface ChoiceFull {
  text: Text;
  branch: string;
  variables?: Record<string, any>;
}
