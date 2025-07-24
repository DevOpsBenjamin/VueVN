import { defineStore } from 'pinia';

// THIS IS A PLACEHOLDER FOR EACH PROJECT'S GAME STATE
// It should be customized per project requirements using plugin capacity
// It's only defined here to make the engine base code having a default store

const useGameState = defineStore('gameState', {
  state: () => ({
    player: { name: '' },
  }),
});
export default useGameState;
