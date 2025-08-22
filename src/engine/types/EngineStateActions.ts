import type { EngineState } from '@/generate/types';

export default interface EngineStateActions {
  resetState(this: EngineState): void;
}