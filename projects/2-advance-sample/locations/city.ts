import type { Location } from '@/generate/types';

const city: Location = {
  id: "city",
  name: "City Center",
  baseBackground: "assets/images/background/city/day.png",
  timeBackgrounds: [
    {
      check: (state) => state.gameTime.hour > 20 || state.gameTime.hour < 6,
      value: "assets/images/background/city/night.png",
    }
  ],
  accessibleLocations: [],
  unlocked: () => true,
  accessErrors: [
    {
      check: (state) => (state.gameTime.hour < 3 || state.gameTime.hour > 23),
      value: "It's too late to go in city"
    }
  ]
};

export default city;