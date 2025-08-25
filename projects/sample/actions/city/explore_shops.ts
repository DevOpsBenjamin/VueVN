import type { Action } from '@/generate/types';
import { city }  from '@/generate/locations';

//THIS ACTION WORK ALL TIME CAUSE WE WANT TO USE EVENT TO TALK TO PLAYER
const explore_shops: Action = {
    id: 'explore_shops',
    name: 'Explore Shops',
    unlocked: (state) => state.location_id === city.id,
    execute: (state) => state.flags.explore_shops = true,
};

export default explore_shops;