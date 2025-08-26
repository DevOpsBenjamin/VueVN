import type { Location } from '@generate/types';

const info: Location = {
  name: "Home Front Door",
  baseBackground: "assets/images/background/home/front_door.png",
  timeBackgrounds: [
    {
      check: (state) => state.gameTime.hour > 20 || state.gameTime.hour < 6,
      value: "assets/images/background/home/front_door_night.png",
    }
  ],
  accessibleLocations: ["hallway", "city"],
  unlocked: () => true,
  accessErrors: []
};

export default info;