import { TimeHelper } from '@/generate/runtime';
import type { GameState, Action } from '@/generate/types';

const wait: Action = {
    id: "wait",
    name: "Wait 1H",
    unlocked: () => true,
    execute: (state) => TimeHelper.waitOneHour(state.gameTime),
};

export default wait;