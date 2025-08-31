import type { VNAction } from '@generate/types';

const afterWorkWalk: VNAction = {
  id: 'after_work_walk',
  name: "Wait for Maya After Work",
  unlocked: (state) => {
    const hour = state.gameTime.hour;
    return hour >= state.barista.workSchedule.endHour && hour <= 22;
  },
  execute: (state) => state.flags.maya_romantic_walk = true
};

export default afterWorkWalk;
