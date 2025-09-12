import type { DateableNPC } from 'generate/types';
import { RelationLevel } from '@generate/enums';

// Internal variable
const THRESHOLDS = {
  acquaintance: 10,
  friend: 30,
  close_friend: 60
} as const;

const MaxRelation = 100;

class RelationManager {
  static addRelation(npc: DateableNPC, amount: number): void {
    npc.relation = Math.min(npc.relation + amount, MaxRelation);
    this.updateRelationshipLevel(npc);
  }

  static removeRelation(npc: DateableNPC, amount: number, min: number = 10): void {
    if (npc.relation < min) {
      npc.relation = Math.max(npc.relation - amount, 0);
      return;
    }
    npc.relation = Math.max(npc.relation - amount, min);
    this.updateRelationshipLevel(npc);
  }

  static updateRelationshipLevel(npc: DateableNPC): void {
    if (npc.relation >= THRESHOLDS.close_friend) {
      npc.relationship = RelationLevel.CLOSE_FRIEND;
    } else if (npc.relation >= THRESHOLDS.friend) {
      npc.relationship = RelationLevel.FRIEND;
    } else if (npc.relation >= THRESHOLDS.acquaintance) {
      npc.relationship = RelationLevel.ACQUAINTANCE;
    }
  }

  static getRelationStatus(npc: DateableNPC): { level: RelationLevel; points: number; nextThreshold: number | null } {
    let nextThreshold: number | null = null;

    switch (npc.relationship) {
      case RelationLevel.STRANGER:
        nextThreshold = THRESHOLDS.acquaintance;
        break;
      case RelationLevel.ACQUAINTANCE:
        nextThreshold = THRESHOLDS.friend;
        break;
      case RelationLevel.FRIEND:
        nextThreshold = THRESHOLDS.close_friend;
        break;
      case RelationLevel.CLOSE_FRIEND:
        nextThreshold = null;
        break;
    }

    return {
      level: npc.relationship,
      points: npc.relation,
      nextThreshold
    };
  }

  static interactDaily(npc: DateableNPC): boolean {
    if (npc.daily.interacted == true) {
      return false;
    }
    const relationGain = Math.floor(Math.random() * 3) + 1;
    this.addRelation(npc, relationGain);
    npc.daily.interacted = true;
    return true;
  }
}

export default RelationManager;  
