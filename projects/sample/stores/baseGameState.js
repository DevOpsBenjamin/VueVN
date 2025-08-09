const NPC_BASE = {
  name: '',
  flags: {},
};

function createNPC(overrides = {}) {
  return {
    ...NPC_BASE,
    ...overrides,
  };
}

const BASE_GAME_STATE = {
  player: { name: '' },
  location: 'start',
  flags: { introSeen: false },
  npcs: {
    npc: createNPC({ name: 'Sample NPC' }),
  },
};

export default {
  createNPC,
  BASE_GAME_STATE,
};
