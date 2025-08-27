import { NPC } from "@generate/types";

export type RelationLevel = 'stranger' | 'acquaintance' | 'friend' | 'close_friend';

export interface DateableNPC extends NPC {
  name: string;
  relation: number;
  relationship: RelationLevel;
}