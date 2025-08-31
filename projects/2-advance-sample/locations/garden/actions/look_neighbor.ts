import type { VNAction } from '@generate/types';

const look_neighbor: VNAction = {
    id: "look_neighbor",
    name: "Look at Neighbor",
    unlocked: () => true,
    execute: (state) => state.flags.look_neighbor = true,
};

export default look_neighbor;
