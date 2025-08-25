import type { Location } from '@/generate/types';

const neighbor_entrance: Location = {
  id: "neighbor_entrance",
  name: "Neighbor's Front Door",
  baseBackground: "assets/images/background/neighbor/entrance.png",
  timeBackgrounds: [],
  accessibleLocations: [],
  unlocked: () => true,
  accessErrors: [
    {
      check: (state) => state.neighbor.relation > 20 && (state.gameTime.hour < 5 || state.gameTime.hour > 22),
      value: "Even if you are close to your neigbor now it's a bit late!"
    },
    {
      check: (state) => state.neighbor.relation <= 20 && (state.gameTime.hour < 8 || state.gameTime.hour > 17),
      value: "It's clearly not a good time to bother someone you know so little about"
    }
  ]
};

export default neighbor_entrance;