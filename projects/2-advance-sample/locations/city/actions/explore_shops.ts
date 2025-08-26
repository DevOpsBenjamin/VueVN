import type { Action } from '@generate/types';

//THIS ACTION WORK ALL TIME CAUSE WE WANT TO USE EVENT TO TALK TO PLAYER
const explore_shops: Action = {
    id: 'explore_shops',
    name: 'Explore Shops',
    unlocked: () => true,
    execute: (state) => state.flags.explore_shops = true,
};

export default explore_shops;