import { NPC } from "@generate/types";

export interface Neighbor extends NPC{
  name: string;  
  relation: number;
  relationship: string;
}