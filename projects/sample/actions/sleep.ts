import { TimeHelper } from '@/generate/runtime';
import type { GameState, Action } from '@/generate/types';

const sleep: Action = {
    id: "sleep",
    name: "Sleep",
    unlocked: (state) => TimeHelper.canSleep(state.gameTime),
    execute: (state) => TimeHelper.sleep(state.gameTime),
};

export default sleep;