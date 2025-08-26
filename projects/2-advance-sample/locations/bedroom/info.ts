import type { Location } from '@generate/types';

const info: Location = {
  name: "Bedroom",
  baseBackground: "/bedroom/images/background/morning.png",
  timeBackgrounds: [
    {
      check: (state) => state.gameTime.hour > 20 || state.gameTime.hour < 5,
      value: "/bedroom/images/background/night.png",
    }
  ],
  unlocked: () => true,
  accessErrors: []
};

export default info;