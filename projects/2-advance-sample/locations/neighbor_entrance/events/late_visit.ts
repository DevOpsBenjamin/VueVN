import type { VNEvent } from '@generate/types';
import t from '@generate/texts';

const lateVisit: VNEvent = {
  name: 'Late Visit Attempt',
  foreground: 'assets/images/background/neighbor/entrance.png',  
  conditions: (state) => state.flags.knock_door === true && (state.gameTime.hour < 9 || state.gameTime.hour > 16),
  unlocked: (state) => state.gameTime.hour > 18,
  locked: (state) => false,
  
  async execute(engine, state) {
    const text = (t as any).locations.neighbor_entrance.late_visit;
    const currentRelation = state.neighbor.relation;
    const currentRelationship = state.neighbor.relationship;
    
    await engine.showText(text.knock_sound);
      state.player.lust += 2;
    
    if (currentRelationship == 'close_friend') {
      await engine.showText(text.close_friend_open);
      state.player.lust += 1;
      state.neighbor.relation = Math.min(currentRelation + 5, 100);
      await engine.showText(text.close_friend_hey_honey, `${state.neighbor.name}`);
    }
    else {      
      state.neighbor.relation = Math.max(currentRelation - 1, 0);
      await engine.showText(text.night_dress_open);
      await engine.showText(text.night_late_question, `${state.neighbor.name}`);
    }
    await engine.showText(text.blush);
    await engine.showText(text.sorry_bother, `${state.player.name}`);
    await engine.showText(text.goodnight, `${state.neighbor.name}`);
    await engine.showText(text.smile_effect);
  }
};

export default lateVisit;
