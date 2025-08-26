import { NPC } from "@engine/types/stores/NPC";

class NPCCreator implements NPC {
  name: string;
  flags: Record<string, boolean>;

  constructor(name: string) {
    this.name = name;
    this.flags = {}
  }
}

export default NPCCreator;