import { defineStore } from "pinia";
import { neighbor } from "@/generate/npcs";
import type { GameState, GameStateActions } from "@/generate/types";

export const useGameState = defineStore("gameState", {
  state: (): GameState => ({
    player: { name: "" },
    location: "start",
    flags: {},
    neighbor,
    myCustomField: "",
    myCustomArray: [],
    lastMinigameResult: undefined,
  }),
  actions: {
    resetGame(): void {
      console.debug('Resetting game state');
      Object.assign(this, {
        player: { name: "" },
        location: "start", 
        flags: {},
        neighbor,
        myCustomField: "",
        myCustomArray: [],
        lastMinigameResult: undefined,
      });
    },
  } satisfies GameStateActions,
});

export default useGameState;
