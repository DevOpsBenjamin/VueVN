import { defineStore } from 'pinia';

//YOU MUST DEFINE YOUR OWN STORE AS A PLUGIN
const useGameState = defineStore('gameState', {
  state: () => ({
    player: { name: '' },
    flags: {},
  }),
});
export default useGameState;
