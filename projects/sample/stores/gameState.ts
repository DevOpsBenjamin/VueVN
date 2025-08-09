import { defineStore } from "pinia";
import { baseGameState } from "@/generate/stores";
import { npc_1 } from "@/generate/npcs";
const { BASE_GAME_STATE } = baseGameState;

const useGameState = defineStore("gameState", {
  state: () => ({
    ...BASE_GAME_STATE,
    npc_1,
    myCustomField: "",
    myCustomArray: [] as string[],
  }),
  actions: {
    resetGame() {
      Object.assign(this, {
        ...BASE_GAME_STATE,
        npc_1,
        myCustomField: "",
        myCustomArray: [],
      });
    },
  },
});

export default useGameState;
