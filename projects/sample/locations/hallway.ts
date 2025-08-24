import type { Location } from '@/generate/types';

const hallway: Location = {
  id: "hallway",
  name: "Hallway",
  baseBackground: "assets/images/background/intro/hall.png",
  timeBackgrounds: [],
  accessibleLocations: ["bedroom", "mother_bedroom"],
  unlocked: (state) => true,
  accessErrors: []
};

export default hallway;
