import { defineStore } from "pinia";
import { neighbor, mother, player } from "@/generate/npcs";
import type { GameState, GameStateActions } from "@/generate/types";
import { start } from "@/generate/locations";

//SEE CUSTOM SAMPLE FOR BETTER TYPING
function createGameState(): GameState
{
  return {
    player: {
      name: "MC",
      stat: 100,
      flags: {}
    },
    location_id: start.id,
    gameTime: {
      hour: 8,
      day: 1,
      month: 6,
      year: 2024
    },
    flags: {},
    neighbor:  {
      name: "Sarah",
      stat: 0,
      flags: {}
    },
    mother:  {
      name: "Mom",
      stat: 0,
      flags: {}
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

