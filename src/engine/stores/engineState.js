import { defineStore } from 'pinia';
import { ref } from 'vue';

const useEngineState = defineStore('engineState', () => {
  const background = ref(null);
  const dialogue = ref(null);
  const in_menu = ref(true);
  const initialized = ref(false);

  return {
    in_menu,
    initialized,
    background,
    dialogue,
  };
});
export default useEngineState;
