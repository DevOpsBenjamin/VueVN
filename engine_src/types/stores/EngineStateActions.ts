import type { EngineState } from '@generate/types';

export interface EngineStateActions {
  resetState(this: EngineState): void;
}