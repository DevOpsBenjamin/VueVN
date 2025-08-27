import type { Action } from '@generate/types';

const talkBarista: Action = {
  id: 'talk_barista',
  name: "Talk to Maya",
  unlocked: (state) => {
    const hour = state.gameTime.hour;
    
    // Simple check: barista works Monday-Saturday, 7AM-7PM
    return hour >= state.barista.workSchedule.startHour &&
           hour < state.barista.workSchedule.endHour;
  },
  execute: (state) => state.flags.talk_barista = true
};

export default talkBarista;