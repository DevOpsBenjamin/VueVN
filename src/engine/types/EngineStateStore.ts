import type { EngineState, EngineStateActions } from '@/generate/types';

// Pinia store type that combines EngineState interface + store methods + EngineStateActions
export type EngineStateStore = EngineState & {
  // Pinia built-in methods
  $state: EngineState;
  $reset: () => void;
  $patch: (partialState: Partial<EngineState>) => void;
} & EngineStateActions;