import type { VNAction } from '@generate/types';

const stargazeTogether: VNAction = {
  id: 'stargaze_together',
  name: "Stargaze with Sarah",
  unlocked: (state) => {
    const hour = state.gameTime.hour;
    const relationshipLevel = state.neighbor.relationship;
    
    // Available at night when relationship is friend or higher
    return (hour >= 21 || hour <= 2) &&
           (relationshipLevel === 'friend' || relationshipLevel === 'close_friend');
  },
  execute: (state) => state.flags.sarah_stargazing = true
};

export default stargazeTogether;