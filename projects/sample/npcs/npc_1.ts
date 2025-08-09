import { baseGameState } from "@/generate/stores";
const { createNPC } = baseGameState;

const npc_1 = createNPC({
  name: "NPC 1",
  relation: 0,
  trust: 0,
});

export default npc_1;
