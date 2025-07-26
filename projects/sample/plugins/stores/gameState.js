import { defineStore } from 'pinia';

import { baseGameState } from '@/generate/engine';
const { BASE_GAME_STATE, createNPC } = baseGameState;

const useGameState = defineStore('gameState', {
  state: () => ({
    // 🚨 PROTECTED - Required by engine, do not remove/rename
    ...BASE_GAME_STATE,

    //Sample NPC DEFINITION
    npc_1: createNPC({
      name: 'NPC',
      relation: 0,
      trust: 0,
    }),

    // ✅ SAFE TO MODIFY - Your custom fields below
    myCustomField: '',
    myCustomArray: [],
  }),

  actions: {
    // Your actions
  },
});

export default useGameState;
