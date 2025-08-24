import type { Location } from '@/generate/types';

const bedroom: Location = {
  id: "bedroom",
  name: "Bedroom",
  baseBackground: "assets/images/background/bedroom/morning.png",
  timeBackgrounds: [
    {
      check: (state) => state.gameTime.hour > 18 || state.gameTime.hour < 5,
      value: "assets/images/background/bedroom/morning.png",
    }
  ],
  accessibleLocations: [],
  unlocked: (state) => true,
  accessErrors: []
};

export default bedroom;
