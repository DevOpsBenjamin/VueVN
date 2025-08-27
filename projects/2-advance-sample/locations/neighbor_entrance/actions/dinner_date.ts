import type { Action } from '@generate/types';

const dinnerDate: Action = {
  id: 'dinner_date',
  name: "Dinner with Sarah",
  unlocked: (state) => {
    const hour = state.gameTime.hour;
    return hour >= 17 && hour <= 21;
  },
  execute: (state) => state.flags.sarah_dinner_invitation = true
};

export default dinnerDate;