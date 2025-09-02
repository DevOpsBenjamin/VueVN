import { TimeHelper } from '@generate/engine';
import type { GameState, VNAction } from '@generate/types';

// This is a base action in a free roam engine.
const wait: VNAction = {
    id: "wait",
    name: "Wait 1H",
    unlocked: () => true,
    execute: (state) => TimeHelper.waitOneHour(state.gameTime),
};

export default wait;
