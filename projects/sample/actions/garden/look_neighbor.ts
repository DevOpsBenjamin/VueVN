import type { Action } from '@/generate/types';
import { garden }  from '@/generate/locations';

const look_neighbor: Action = {
    id: "look_neighbor",
    name: "Look at Neighbor",
    unlocked: (state) => state.location_id == garden.id,
    execute: (state) => state.flags.look_neighbor = true,
};

export default look_neighbor;