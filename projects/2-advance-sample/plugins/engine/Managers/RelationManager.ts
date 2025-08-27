import type { GameState } from '@generate/types';
import type { DateableNPC, RelationLevel } from '../../types/stores/npcs/DateableNPC';

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
    
    if (oldLevel === 'stranger' && npc.relationship !== 'stranger') {
      npc.flags.first_relationship_upgrade = true;
    }
  }

  static removeRelation(npc: DateableNPC, amount: number, min: number = 10): void {
    npc.relation = Math.max(npc.relation - amount, min);
    if (npc.relationship !== 'stranger') {
      this.updateRelationshipLevel(npc);
    }
  }

  static setRelation(npc: DateableNPC, amount: number): void {
    npc.relation = Math.max(10, Math.min(amount, 100));
    if (npc.relationship !== 'stranger') {
      this.updateRelationshipLevel(npc);
    }
  }

  static updateRelationshipLevel(npc: DateableNPC): void {
    if (npc.relation >= this.THRESHOLDS.close_friend && npc.relationship !== 'close_friend') {
      npc.relationship = 'close_friend';
    } else if (npc.relation >= this.THRESHOLDS.friend && npc.relationship === 'acquaintance') {
      npc.relationship = 'friend';
    } else if (npc.relation >= this.THRESHOLDS.acquaintance && npc.relationship === 'stranger') {
      npc.relationship = 'acquaintance';
    }
  }

  static canDowngrade(npc: DateableNPC): boolean {
    return npc.relationship !== 'stranger';
  }

  static getRelationStatus(npc: DateableNPC): { level: RelationLevel; points: number; nextThreshold: number | null } {
    let nextThreshold: number | null = null;
    
    switch (npc.relationship) {
      case 'stranger':
        nextThreshold = this.THRESHOLDS.acquaintance;
        break;
      case 'acquaintance':
        nextThreshold = this.THRESHOLDS.friend;
        break;
      case 'friend':
        nextThreshold = this.THRESHOLDS.close_friend;
        break;
      case 'close_friend':
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
    const levels: RelationLevel[] = ['stranger', 'acquaintance', 'friend', 'close_friend'];
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