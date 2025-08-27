import type { Action } from '@generate/types';

const privateDate: Action = {
  id: 'private_date',
  name: "Private Coffee Date (After Hours)",
  unlocked: (state) => {
    const hour = state.gameTime.hour;
    const relationshipLevel = state.barista.relationship;
    return hour >= 20 && relationshipLevel === 'close_friend';
  },
  execute: (state) => state.flags.maya_private_date = true
};

export default privateDate;