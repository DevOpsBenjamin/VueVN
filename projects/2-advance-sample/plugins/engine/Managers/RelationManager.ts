import type { GameState } from '@generate/types';
import type { DateableNPC } from 'generate/types';
import { RelationLevel } from '@generate/enums';

class RelationManager {
  static readonly THRESHOLDS = {
    acquaintance: 10,
    friend: 30,
    close_friend: 60
  };

  static addRelation(npc: DateableNPC, amount: number, max: number = 100): void {
    const oldLevel = npc.relationship;
    npc.relation = Math.min(npc.relation + amount, max);
    this.updateRelationshipLevel(npc);
    
    if (oldLevel === RelationLevel.STRANGER && npc.relationship !== RelationLevel.STRANGER) {
      npc.flags.first_relationship_upgrade = true;
    }
  }

  static removeRelation(npc: DateableNPC, amount: number, min: number = 10): void {
    npc.relation = Math.max(npc.relation - amount, min);
    if (npc.relationship !== RelationLevel.STRANGER) {
      this.updateRelationshipLevel(npc);
    }
  }

  static setRelation(npc: DateableNPC, amount: number): void {
    npc.relation = Math.max(10, Math.min(amount, 100));
    if (npc.relationship !== RelationLevel.STRANGER) {
      this.updateRelationshipLevel(npc);
    }
  }

  static updateRelationshipLevel(npc: DateableNPC): void {
    if (npc.relation >= this.THRESHOLDS.close_friend && npc.relationship !== RelationLevel.CLOSE_FRIEND) {
      npc.relationship = RelationLevel.CLOSE_FRIEND;
    } else if (npc.relation >= this.THRESHOLDS.friend && npc.relationship === RelationLevel.ACQUAINTANCE) {
      npc.relationship = RelationLevel.FRIEND;
    } else if (npc.relation >= this.THRESHOLDS.acquaintance && npc.relationship === RelationLevel.STRANGER) {
      npc.relationship = RelationLevel.ACQUAINTANCE;
    }
  }

  static canDowngrade(npc: DateableNPC): boolean {
    return npc.relationship !== RelationLevel.STRANGER;
  }

  static getRelationStatus(npc: DateableNPC): { level: RelationLevel; points: number; nextThreshold: number | null } {
    let nextThreshold: number | null = null;
    
    switch (npc.relationship) {
      case RelationLevel.STRANGER:
        nextThreshold = this.THRESHOLDS.acquaintance;
        break;
      case RelationLevel.ACQUAINTANCE:
        nextThreshold = this.THRESHOLDS.friend;
        break;
      case RelationLevel.FRIEND:
        nextThreshold = this.THRESHOLDS.close_friend;
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

  static isRelationAtLeast(npc: DateableNPC, level: RelationLevel): boolean {
    const levels: RelationLevel[] = [RelationLevel.STRANGER, RelationLevel.ACQUAINTANCE, RelationLevel.FRIEND, RelationLevel.CLOSE_FRIEND];
    const currentIndex = levels.indexOf(npc.relationship);
    const targetIndex = levels.indexOf(level);
    return currentIndex >= targetIndex;
  }

  static interactDaily(state: GameState, npcKey: keyof GameState, relationGain: number = 1): boolean {
    const today = `${state.gameTime.month}-${state.gameTime.day}`;
    const dailyFlag = `${npcKey}_interaction_${today}`;
    
    if (state.flags[dailyFlag]) {
      return false;
    }
    
    const npc = state[npcKey] as DateableNPC;
    this.addRelation(npc, relationGain);
    state.flags[dailyFlag] = true;
    return true;
  }

  static resetDailyInteractions(state: GameState, npcKey: keyof GameState): void {
    const today = `${state.gameTime.month}-${state.gameTime.day}`;
    const dailyFlag = `${npcKey}_interaction_${today}`;
    delete state.flags[dailyFlag];
  }

  static hasInteractedToday(state: GameState, npcKey: keyof GameState): boolean {
    const today = `${state.gameTime.month}-${state.gameTime.day}`;
    const dailyFlag = `${npcKey}_interaction_${today}`;
    return state.flags[dailyFlag] === true;
  }
}

export default RelationManager;