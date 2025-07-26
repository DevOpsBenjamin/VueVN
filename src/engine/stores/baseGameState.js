const BASE_GAME_STATE = {
  player: { name: '' },
  location: 'start',
  flags: [],
};

// NPC template structure
const NPC_BASE = {
  name: '',
  flags: [],
};

// Helper function to create a new NPC with defaults
function createNPC(overrides = {}) {
  return {
    ...NPC_BASE,
    ...overrides,
  };
}

export default {
  createNPC,
  BASE_GAME_STATE,
};
