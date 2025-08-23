import { defineStore } from 'pinia';
import type { EngineState, EngineStateActions } from '@/generate/types';
import { EngineStateEnum } from '@/generate/enums';

export const useEngineState = defineStore('engineState', {
  state: (): EngineState => ({
    background: null,
    foreground: null,
    dialogue: null,
    initialized: false,
    //isSimulating: false,
    //isFastForwarding: false,
    state: EngineStateEnum.MENU,
    currentEvent: null,
    currentStep: 0,
    choices: null,
    customArgs: null,
    jumpEvent: null
  }),
  actions: {
    resetState(): void {
      console.debug('Resetting engine state');
      this.background = null;
      this.foreground = null;
      this.dialogue = null;
      this.initialized = true;
      this.currentEvent = null;
      this.currentStep = 0;
      this.choices = null;
      //this.isSimulating = false;
      //this.isFastForwarding = false;
    },
  } satisfies EngineStateActions,
});

export default useEngineState;
