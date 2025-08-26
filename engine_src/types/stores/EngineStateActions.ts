import type { EngineState } from '@generate/types';

export interface EngineStateActions {
  $reset(this: EngineState): void;
}