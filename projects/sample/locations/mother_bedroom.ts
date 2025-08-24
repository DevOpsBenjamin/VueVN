import type { Location } from '@/generate/types';

const motherBedroom: Location = {
  id: "mother_bedroom",
  name: "Mother's Room",
  baseBackground: "assets/images/background/mother_bedroom/day.png",
  accessibleLocations: ["hallway"],
  timeBackgrounds: [],
  unlocked: (state) => state.flags.metMother === true,
  accessErrors: [
    {
      check: (state) => (state.gameTime.hour < 6 || state.gameTime.hour > 22),
      value: "Your mother is sleeping"
    }
  ]
};

export default motherBedroom;
