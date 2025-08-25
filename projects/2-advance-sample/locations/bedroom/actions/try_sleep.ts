import { TimeHelper } from '@/generate/runtime';
import type { Action } from '@/generate/types';
import { bedroom }  from '@/generate/locations';

//THIS ACTION CONTRARY TO city/explore HANDLE IT'S EXECUTION RIGHT
const try_sleep: Action = {
    id: "try_sleep",
    name: "Sleep",
    unlocked: (state) => TimeHelper.canSleep(state.gameTime),
    execute: (state) => state.flags.try_sleep = true,
};

export default try_sleep;