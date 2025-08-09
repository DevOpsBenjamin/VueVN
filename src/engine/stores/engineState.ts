import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ENGINE_STATES } from './engineStateEnum';
import type { Dialogue, EngineState } from '../runtime/types';

const useEngineState = defineStore('engineState', () => {
  const background = ref<string | null>(null);
  const foreground = ref<string | null>(null);
  const dialogue = ref<Dialogue | null>(null);
  const initialized = ref(false);
  const state = ref<string>(ENGINE_STATES.MENU);

  const currentEvent = ref<string | null>(null);
  const currentStep = ref(0);
  const choices = ref<Array<{ text: string; id: string }> | null>(null);

  function resetState(): void {
    console.debug('Resetting engine state');
    background.value = null;
    foreground.value = null;
    dialogue.value = null;
    initialized.value = true;
    currentEvent.value = null;
    currentStep.value = 0;
    choices.value = null;
  }

  return {
    state,
    currentEvent,
    currentStep,
    initialized,
    background,
    foreground,
    dialogue,
    choices,
    resetState,
  };
});

export type EngineStateStore = ReturnType<typeof useEngineState> & EngineState;

export default useEngineState;
