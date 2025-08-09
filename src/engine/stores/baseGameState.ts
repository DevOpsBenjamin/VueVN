export interface NPC {
  name: string;
  flags: Record<string, any>;
  [key: string]: any;
}

export const NPC_BASE: NPC = {
  name: "",
  flags: {},
};

export function createNPC(overrides: Partial<NPC> = {}): NPC {
  return {
    ...NPC_BASE,
    ...overrides,
  };
}

export interface BaseGameState {
  player: { name: string };
  location: string;
  flags: Record<string, any>;
  [key: string]: any;
}

export const BASE_GAME_STATE: BaseGameState = {
  player: { name: "" },
  location: "start",
  flags: {},
};

export default {
  createNPC,
  BASE_GAME_STATE,
};
