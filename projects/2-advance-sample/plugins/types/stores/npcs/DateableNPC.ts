import { NPC } from "@generate/types";
import { RelationLevel } from "@generate/enums";

export interface DateableNPC extends NPC {
  name: string;
  relation: number;
  relationship: RelationLevel;
}