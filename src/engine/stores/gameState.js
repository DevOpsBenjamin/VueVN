import { defineStore } from 'pinia';

const useGameState = defineStore('gameState', {
  state: () => ({
    player: { name: '' },
    flags: {},
  }),
});
export default useGameState;
