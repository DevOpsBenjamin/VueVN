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
    // Your actions
  },
});

export default useGameState;
