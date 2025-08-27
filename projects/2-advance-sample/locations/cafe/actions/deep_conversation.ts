import type { Action } from '@generate/types';

const deepConversation: Action = {
  id: 'deep_conversation',
  name: "Deep Talk with Maya",
  unlocked: (state) => {
    const hour = state.gameTime.hour;
    // Available during work hours but not during busy periods
    return (hour >= state.barista.workSchedule.startHour && 
            hour < state.barista.workSchedule.endHour) &&
           !(hour >= 10 && hour <= 14); // Avoid lunch rush
  },
  execute: (state) => state.flags.maya_deep_conversation = true
};

export default deepConversation;