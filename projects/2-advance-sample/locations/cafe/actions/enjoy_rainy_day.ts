import type { VNAction } from '@generate/types';

const enjoyRainyDay: VNAction = {
  id: 'enjoy_rainy_day',
  name: "Enjoy Rainy Day with Maya",
  unlocked: (state) => {
    const hour = state.gameTime.hour;
    const relationshipLevel = state.barista.relationship;
    // This could be enhanced with actual weather system check
    const isRainyWeather = Math.random() < 0.3; // 30% chance for demo purposes
    
    // Available during work hours in rainy weather when relationship is established
    return hour >= 12 && hour <= 17 &&
           (relationshipLevel === 'friend' || relationshipLevel === 'close_friend') &&
           isRainyWeather;
  },
  execute: (state) => state.flags.maya_rainy_day = true
};

export default enjoyRainyDay;