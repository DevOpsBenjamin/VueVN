import { defineStore } from "pinia";
import type { GameState } from "@engine/types/stores/GameState";
import type { GameStateActions } from "@engine/types/stores/GameStateActions";

function createGameState(): GameState
{
  return {
    player: { name: "MC" },
    location_id: "bedroom",
    flags: {},
    gameTime: {
      hour: 8,
      day: 1,
      month: 6,
      year: 2024
    }
  }
}

export const useGameState = defineStore("gameState", {
  state: (): GameState => (createGameState()),
  actions: {
    resetGame(): void {
      Object.assign(this, createGameState());
    },
  } satisfies GameStateActions,
});

export default useGameState;

