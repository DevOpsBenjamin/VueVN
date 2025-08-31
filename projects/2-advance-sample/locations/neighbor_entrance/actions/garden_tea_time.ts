import type { VNAction } from '@generate/types';

const gardenTeaTime: VNAction = {
  id: 'garden_tea_time',
  name: "Garden Tea Time with Sarah",
  unlocked: (state) => {
    const hour = state.gameTime.hour;
    const relationshipLevel = state.neighbor.relationship;
    
    // Available in afternoon when relationship is developing
    return hour >= 14 && hour <= 17 &&
           (relationshipLevel === 'acquaintance' || 
            relationshipLevel === 'friend' || 
            relationshipLevel === 'close_friend');
  },
  execute: (state) => state.flags.sarah_garden_tea = true
};

export default gardenTeaTime;