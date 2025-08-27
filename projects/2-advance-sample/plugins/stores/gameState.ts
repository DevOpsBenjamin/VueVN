import { defineStore } from "pinia";
import type { GameState, GameStateActions } from "@generate/types";
import { playerCreator, neighborCreator, motherCreator, timeCreator, baristaCreator } from '@generate/stores'

//SEE CUSTOM SAMPLE FOR BETTER TYPING
function createGameState(): GameState
{
  return {
    player: playerCreator(),
    location_id: "bedroom",
    gameTime: timeCreator(),
    neighbor: neighborCreator(),
    mother:  motherCreator(),
    barista: baristaCreator(),
    flags: {},
  }
}

export const useGameState = defineStore("gameState", {
  state: (): GameState => (createGameState()),
  actions: {
    $reset(): void {
      Object.assign(this, createGameState());
    },
  } satisfies GameStateActions,
  persist: true
});

export default useGameState;

