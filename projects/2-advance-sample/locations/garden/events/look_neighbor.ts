import type { VNEvent } from '@generate/types';

const look_neighbor: VNEvent = {
  name: 'Look at neighbor',
  foreground: 'assets/images/background/garden/day.png',
  conditions: (state) => state.flags.look_neighbor === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.look_neighbor = false;
    await engine.showText("You look toward your neighbor's house from the garden.");
    await engine.showText("You can see their backyard and some windows.");
        
    // Special shower window event at specific hours
    if (state.gameTime.hour === 19 || state.gameTime.hour === 7) {
      await engine.showText("Wait... you notice a light on in what looks like a bathroom window.");
      await engine.showChoices([
        { text: 'Look away respectfully', branch: 'look_away' },
        { text: 'Take a quick peek', branch: 'peek_window' }
      ]);
    } else {
      await engine.showText("The windows are dark. Your neighbor must be out or sleeping.");      
    }
  },
    
  branches: {
    look_away: {
      async execute(engine, state) {
        await engine.showText("You respect your neighbor's privacy and look away.");
        await engine.showText("That was the right thing to do.");
        const currentRelation = state.neighbor.relation;
        state.neighbor.relation = Math.min(currentRelation + 1, 100);
        await engine.showText("Your conscience is clear. You go back to your day", "System");
      }
    },
    
    peek_window: {
      async execute(engine, state) {
        await engine.showText("You can't help but take a quick look...");
        await engine.showText("You see a silhouette behind the frosted glass - your neighbor is taking a shower.");

        if (Math.random() < 0.3) { // 30% chance of being caught          
          await engine.showText("Oh no! Your neighbor noticed movement in the garden!");
          const currentRelation = state.neighbor.relation;
          if (state.neighbor.relation > 15) {
            state.neighbor.relation = Math.min(currentRelation + 2, 100);
            await engine.showText("She look at you and seem to have no intention of closing the curtains.\nShe wink at you and let you have a look. She probably like you a bit more now.");
          } else {
            state.neighbor.relation = Math.max(currentRelation - 3, 0);
            await engine.showText("She quickly close the curtains. And look angry, she probably like you a bit less now.");
          }
        }
        state.player.lust += 1;
        await engine.showText("You quickly look away, feeling a bit guilty.");
      }
    }
  }
};

export default look_neighbor;