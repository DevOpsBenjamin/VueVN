import type { Location } from '@generate/types';

const info: Location = {
  name: "Coffee Shop",
  baseBackground: "/cafe/images/background/day.png", // Placeholder - could be cafe-specific later
  timeBackgrounds: [],
  unlocked: () => true,
  accessErrors: []
};

export default info;
