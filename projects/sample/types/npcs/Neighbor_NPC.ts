import type { NPC } from '@/generate/types';

// Sample project specific NPC - neighbor character  
export interface Neighbor_NPC extends NPC {
  relation: number;
  trust: number;
  relationshipStatus: 'stranger' | 'acquaintance' | 'friend' | 'close_friend';
  lastInteraction?: string;
  favoriteTopics: string[];
}