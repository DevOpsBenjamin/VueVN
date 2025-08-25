import type { VNEvent } from '@/generate/types';
import { TimeHelper } from '@/generate/runtime';

const knockDoorStranger: VNEvent = {
  id: 'knock-door-stranger',
  name: 'Knock Door - Stranger',
  foreground: 'assets/images/background/neighbor/entrance.png',
  conditions: () => false, // Never triggers directly - only via jump
  unlocked: (state) => true,
  locked: (state) => false,
  
  async execute(engine, state) {
    await engine.showText("After a moment, the door opens just slightly...");
    
    // Add neighbor in casual dress
    engine.addForeground('assets/images/characters/neighbor/casual_dress.png');
    
    await engine.showText("A suspicious face peers out through the crack.");
    await engine.showText("'Yes? What do you want?'", state.neighbor.name);
    
    await engine.showChoices([
      { text: 'Introduce yourself politely', branch: 'introduce' },
      { text: 'Ask about the neighborhood', branch: 'neighborhood' },
      { text: 'Apologize and leave', branch: 'leave' }
    ]);
  },

  branches: {
    introduce: {
      async execute(engine, state) {
        await engine.showText(`"Hello, I'm ${state.player.name}. I just moved in next door."`, state.player.name);
        await engine.showText("The neighbor's expression softens slightly.");
        await engine.showText(`"Oh, a new neighbor. I'm ${state.neighbor.name}. Welcome to the neighborhood, I suppose."`, state.neighbor.name);
        
        // Improve relationship
        state.neighbor.relation = Math.min(state.neighbor.relation + 3, 100);
        if (state.neighbor.relation > 20) {
          state.neighbor.relationshipStatus = 'acquaintance';
        }
        
        // Mark daily interaction and advance time
        state.player.daily.visitedNeighbor = true;
        TimeHelper.jump(state.gameTime, 1);
        
        await engine.showText("You feel like you made a good first impression.", "System");
        await engine.showText(`Relationship improved! (${state.neighbor.relation}/100)`, "System");
      }
    },
    
    neighborhood: {
      async execute(engine, state) {
        await engine.showText("'I was wondering if you could tell me about the neighborhood?'", state.player.name);
        await engine.showText("The neighbor looks you up and down suspiciously.");
        await engine.showText("'You seem harmless enough. It's quiet here, mostly families. Keep your noise down.'", state.neighbor.name);
        
        // Small relationship gain
        state.neighbor.relation = Math.min(state.neighbor.relation + 1, 100);
        state.player.daily.visitedNeighbor = true;
        TimeHelper.jump(state.gameTime, 1);
        
        await engine.showText("You learned a bit about the area.", "System");
      }
    },
    
    leave: {
      async execute(engine, state) {
        await engine.showText("'Sorry to bother you. Have a nice day!'", state.player.name);
        await engine.showText("The neighbor nods curtly and closes the door.");
        
        // No relationship change, but still counts as daily interaction
        state.player.daily.visitedNeighbor = true;
        TimeHelper.jump(state.gameTime, 1);
        
        await engine.showText("Maybe you should try to be friendlier next time.", "System");
      }
    }
  }
};

export default knockDoorStranger;