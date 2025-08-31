import { TimeHelper } from '@generate/engine';
import type { VNAction } from '@generate/types';

//THIS ACTION CONTRARY TO city/explore HANDLE IT'S EXECUTION RIGHT
const try_sleep: VNAction = {
    id: "try_sleep",
    name: "Sleep",
    unlocked: (state) => TimeHelper.canSleep(state.gameTime),
    execute: (state) => state.flags.try_sleep = true,
};

export default try_sleep;
