import type { Action } from '@generate/types';

const sundayBreakfast: Action = {
  id: 'sunday_breakfast',
  name: "Sunday Breakfast with Sarah",
  unlocked: (state) => {
    const hour = state.gameTime.hour;
    // Available on weekends during breakfast hours
    return hour >= 8 && hour <= 12;
  },
  execute: (state) => state.flags.sarah_sunday_breakfast = true
};

export default sundayBreakfast;