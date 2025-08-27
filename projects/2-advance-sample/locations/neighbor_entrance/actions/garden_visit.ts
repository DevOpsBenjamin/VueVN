import type { Action } from '@generate/types';

const gardenVisit: Action = {
  id: 'garden_visit',
  name: "Visit Sarah's Garden",
  unlocked: (state) => {
    const hour = state.gameTime.hour;
    return hour >= 8 && hour <= 11;
  },
  execute: (state) => state.flags.sarah_garden_morning = true
};

export default gardenVisit;