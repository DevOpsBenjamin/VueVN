const BASE_GAME_STATE = {
  player: { name: '' },
  npc: {},
  location,
  flags: [],
};

// NPC template structure
const NPC_BASE = {
  name: '',
  flags: [],
};

// Helper function to create a new NPC with defaults
export function createNPC(overrides = {}) {
  return {
    ...NPC_BASE,
    ...overrides,
  };
}

export default BASE_GAME_STATE;
