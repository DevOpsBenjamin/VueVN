import { TimeHelper } from '@/generate/runtime';
import type { Action } from '@/generate/types';
import { bedroom }  from '@/generate/locations';

const sleep: Action = {
    id: "sleep",
    name: "Sleep",
    unlocked: (state) => TimeHelper.canSleep(state.gameTime) && state.location_id == bedroom.id,
    execute: (state) => TimeHelper.sleep(state.gameTime),
};

export default sleep;