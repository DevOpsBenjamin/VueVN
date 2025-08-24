import type { Location } from '@/generate/types';

const start: Location = {
  id: "start",
  name: "Intro location",
  baseBackground: "assets/images/background/intro/hall.png",
  timeBackgrounds: [],
  accessibleLocations: [],
  unlocked: (state) => true,
  accessErrors: []
};

export default start;
