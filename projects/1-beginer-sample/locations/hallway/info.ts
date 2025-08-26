import type { Location } from '@generate/types';

const info: Location = {
  name: "Hallway",
  baseBackground: "assets/images/background/intro/hall.png",
  timeBackgrounds: [],
  accessibleLocations: ["bedroom", "mother_room", "outside"],
  unlocked: () => true,
  accessErrors: []
};

export default info;