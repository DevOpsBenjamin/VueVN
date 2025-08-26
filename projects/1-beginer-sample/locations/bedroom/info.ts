import type { Location } from '@generate/types';

const info: Location = {
  name: "Bedroom",
  baseBackground: "assets/images/background/morning.png",
  timeBackgrounds: [
    {
      check: (state) => state.gameTime.hour > 20 || state.gameTime.hour < 5,
      value: "assets/images/background/night.png",
    }
  ],
  accessibleLocations: ["hallway"],
  unlocked: () => true,
  accessErrors: []
};

export default info;