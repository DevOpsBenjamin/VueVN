import { NPC } from "@generate/types";

class NPCCreator implements NPC {
  name: string;
  flags: Record<string, boolean>;

  constructor(name: string) {
    this.name = name;
    this.flags = {}
  }
}

export default NPCCreator;