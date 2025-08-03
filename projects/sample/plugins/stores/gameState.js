import { defineStore } from 'pinia';

import { baseGameState, npc_1 } from '@/generate/engine';
const { BASE_GAME_STATE } = baseGameState;

const useGameState = defineStore('gameState', {
  state: () => ({
    // 🚨 PROTECTED - Required by engine, do not remove/rename
    ...BASE_GAME_STATE,

    //Sample EXTERNAL NPC
    npc_1,

    // ✅ SAFE TO MODIFY - Your custom fields below
    myCustomField: '',
    myCustomArray: [],
  }),

  actions: {
    resetGame() {
      // Reset all base fields
      Object.assign(this, {
        ...BASE_GAME_STATE,
        npc_1,
        myCustomField: '',
        myCustomArray: [],
      });
    },
    // Your other actions
  },
});

export default useGameState;
