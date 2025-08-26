import type { VNEvent } from '@generate/types';

const lateVisit: VNEvent = {
  name: 'Late Visit Attempt',
  foreground: 'assets/images/background/neighbor/entrance.png',  
  conditions: (state) => state.flags.knock_door === true && (state.gameTime.hour < 9 || state.gameTime.hour > 16),
  unlocked: (state) => state.gameTime.hour > 18,
  locked: (state) => false,
  
  async execute(engine, state) {
    const currentRelation = state.neighbor.relation;
    const currentRelationship = state.neighbor.relationship;
    
    await engine.showText("*knock knock knock*");
      state.player.lust += 2;
    
    if (currentRelationship == 'close_friend') {
      await engine.showText("The neighbor open in her underwear. Looking at you with an intense stare.");
      state.player.lust += 1;
      state.neighbor.relation = Math.min(currentRelation + 5, 100);
      await engine.showText("Hey honey do you need anything?", `${state.neighbor.name}`);    
    }
    else {      
      state.neighbor.relation = Math.max(currentRelation - 1, 0);
      await engine.showText("The neighbor open you in her night dress, abit annoyed you disturb her so late.");
      await engine.showText(`It's a bit late for knocking on neighbor door.\nDid you need anything ${state.player.name}?`, `${state.neighbor.name}`);    
    }
    await engine.showText("You blush from what you see");
    await engine.showText("Sorry to have bother you but i forgot what i wanted", `${state.player.name}`);
    await engine.showText("Goodnight then", `${state.neighbor.name}`);
    await engine.showText("She look at you and smile before closing the door. She is clearly aware her look got an effect on you!");
  }
};

export default lateVisit;