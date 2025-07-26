import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ENGINE_STATES } from './engineStateEnum';

const useEngineState = defineStore('engineState', () => {
  const background = ref(null);
  const dialogue = ref(null);
  const initialized = ref(false);
  const state = ref(ENGINE_STATES.MENU);

  // Current event execution context
  const currentEvent = ref(null);
  const currentStep = ref(0);
  return {
    state,
    //EVENT INFO
    currentEvent,
    currentStep,
    //ENGINE
    initialized,
    background,
    dialogue,
  };
});
export default useEngineState;
