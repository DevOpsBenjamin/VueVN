import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ENGINE_STATES } from './engineStateEnum';

const useEngineState = defineStore('engineState', () => {
  const background = ref(null);
  const foreground = ref(null);
  const dialogue = ref(null);
  const initialized = ref(false);
  const state = ref(ENGINE_STATES.MENU);

  // Current event execution context
  const currentEvent = ref(null);
  const currentStep = ref(0);

  function resetGame() {
    background.value = null;
    foreground.value = null;
    dialogue.value = null;
    initialized.value = true;
    state.value = ENGINE_STATES.MENU;
    currentEvent.value = null;
    currentStep.value = 0;
  }

  return {
    state,
    //EVENT INFO
    currentEvent,
    currentStep,
    //ENGINE
    initialized,
    background,
    dialogue,
    resetGame,
  };
});
export default useEngineState;
