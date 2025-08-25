import type { Location } from '@/generate/types';

const info: Location = {
  name: "Hallway",
  baseBackground: "assets/images/background/intro/hall.png",
  timeBackgrounds: [],
  unlocked: (state) => true,
  accessErrors: []
};

export default info;