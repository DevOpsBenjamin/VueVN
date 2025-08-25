import { TimeHelper } from '@/generate/runtime';
import type { Action } from '@/generate/types';
import { neighbor_entrance }  from '@/generate/locations';

//THIS ACTION CONTRARY TO city/explore HANDLE IT'S EXECUTION RIGHT
const knock_door: Action = {
    id: "knock_door",
    name: "Knock On Door",
    unlocked: () => true,
    execute: (state) => state.flags.knock_door = true,
};

export default knock_door;