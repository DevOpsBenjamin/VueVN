import { defineStore } from "pinia";
import type { GameState, GameStateActions } from "@generate/types";
import { playerCreator, neighborCreator, motherCreator, timeCreator } from '@generate/stores'

//SEE CUSTOM SAMPLE FOR BETTER TYPING
function createGameState(): GameState
{
  return {
    player: playerCreator(),
    location_id: "",//start.id,
    gameTime: timeCreator(),
    neighbor: neighborCreator(),
    mother:  motherCreator(),
    flags: {},
  }
}

export const useGameState = defineStore("gameState", {
  state: (): GameState => (createGameState()),
  actions: {
    resetGame(): void {
      Object.assign(this, createGameState());
    },
  } satisfies GameStateActions,
  persist: true
});

export default useGameState;

