import { defineStore } from 'pinia';
import type { EngineState, EngineStateActions } from '@generate/types';
import { EngineStateEnum } from '@generate/enums';

function createEngineState(): EngineState
{
  return {
    background: null,
    foreground: null,
    dialogue: null,
    initialized: false,
    state: EngineStateEnum.MENU,
    currentEvent: null,
    currentStep: 0,
    choices: null,
    customArgs: null,
    jumpEvent: null
  }
}

export const useEngineState = defineStore('engineState', {
  state: (): EngineState => (createEngineState()),
  actions: {
    resetState(): void {
      Object.assign(this, createEngineState());
    },
  } satisfies EngineStateActions,
});

export default useEngineState;
