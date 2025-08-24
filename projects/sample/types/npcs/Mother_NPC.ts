import type { NPC } from '@/generate/types';

// Sample project specific NPC - neighbor character  
export interface Mother_NPC extends NPC {
  relation: number;
  trust: number;
  
}