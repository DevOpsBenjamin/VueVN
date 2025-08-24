import { defineStore } from "pinia";
import { neighbor, mother } from "@/generate/npcs";
import type { GameState, GameStateActions } from "@/generate/types";

export const useGameState = defineStore("gameState", {
  state: (): GameState => ({
    player: { name: "" },
    location: "start",
    gameTime: {
      hour: 8,
      day: 1,
      month: 6,
      year: 2024
    },
    flags: {},
    neighbor: neighbor,
    mother: mother
  }),
  actions: {
    resetGame(): void {
      console.debug('Resetting game state');
      Object.assign(this, {
        player: { name: "" },
        location: "start", 
        gameTime: {
          hour: 8,
          day: 1,
          month: 6,
          year: 2024
        },
        flags: {},
        neighbor: neighbor,
        mother: mother
      });
    },
  } satisfies GameStateActions,
});

export default useGameState;
