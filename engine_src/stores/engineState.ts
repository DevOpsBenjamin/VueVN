import { defineStore } from 'pinia';
import type { EngineState, EngineStateActions, Settings } from '@generate/types';
import { EngineStateEnum } from '@generate/enums';

function createDefaultSettings(): Settings {
  return {
    language: 'en',
    soundVolume: 80,
    musicVolume: 60,
    textSpeed: 50,
    autoAdvance: false,
    autoAdvanceDelay: 3000
  };
}

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
    jumpEvent: null,
    settings: createDefaultSettings()
  }
}

export const useEngineState = defineStore('engineState', {
  state: (): EngineState => (createEngineState()),
  actions: {
    $reset(): void {
      Object.assign(this, createEngineState());
    },
  } satisfies EngineStateActions,
  persist: true
});

export default useEngineState;
