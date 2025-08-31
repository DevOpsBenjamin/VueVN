import type { VNAction } from '@generate/types';

const haveCoffeeDate: VNAction = {
  id: 'have_coffee_date',
  name: "Have Coffee Date with Maya",
  unlocked: (state) => {
    const hour = state.gameTime.hour;
    const relationshipLevel = state.barista.relationship;
    
    // Available during work hours when relationship is developing
    return hour >= 10 && hour <= 18 &&
           (relationshipLevel === 'acquaintance' || 
            relationshipLevel === 'friend' || 
            relationshipLevel === 'close_friend') &&
           !state.flags.maya_first_connection; // Reset this flag periodically or use a cooldown
  },
  execute: (state) => state.flags.maya_first_connection = true
};

export default haveCoffeeDate;