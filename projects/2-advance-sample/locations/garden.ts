import type { Location } from '@/generate/types';

const garden: Location = {
  id: "garden",
  name: "Garden",
  baseBackground: "assets/images/background/garden/day.png",
  timeBackgrounds: [
    {
      check: (state) => state.gameTime.hour > 18 || state.gameTime.hour < 6,
      value: "assets/images/background/garden/night.png",
    }
  ],
  accessibleLocations: [],
  unlocked: () => true,
  accessErrors: []
};

export default garden;