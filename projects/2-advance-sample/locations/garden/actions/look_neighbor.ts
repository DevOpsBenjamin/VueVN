import type { Action } from '@generate/types';

const look_neighbor: Action = {
    id: "look_neighbor",
    name: "Look at Neighbor",
    unlocked: () => true,
    execute: (state) => state.flags.look_neighbor = true,
};

export default look_neighbor;