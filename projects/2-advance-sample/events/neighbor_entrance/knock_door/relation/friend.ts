import type { VNEvent } from '@/generate/types';
import { TimeHelper } from '@/generate/runtime';

const knockDoorFriend: VNEvent = {
  id: 'knock-door-friend',
  name: 'Knock Door - Friend',
  foreground: 'assets/images/background/neighbor/entrance.png',
  conditions: () => false, // Never triggers directly - only via jump
  unlocked: (state) => true,
  locked: (state) => false,
  
  async execute(engine, state) {
    await engine.showText("The door opens after a moment, and your neighbor greets you with a warm smile.");
    
    // Add neighbor in friendly home outfit
    engine.addForeground('assets/images/characters/neighbor/home_outfit.png');
    
    await engine.showText(`"Hey ${state.player.name}! Nice to see you again. Come on in!"`, state.neighbor.name);
    await engine.showText("She steps aside and gestures for you to enter.");
    
    await engine.showChoices([
      { text: 'Accept invitation and enter', branch: 'enter' },
      { text: 'Chat at the doorway', branch: 'doorway_chat' },
      { text: 'Ask if she needs help with anything', branch: 'offer_help' }
    ]);
  },

  branches: {
    enter: {
      async execute(engine, state) {
        // Change scene to inside neighbor's house (replace base + add character)
        engine.setForeground(['assets/images/background/neighbor/living_room.png']);
        engine.addForeground('assets/images/characters/neighbor/home_outfit.png');
        
        await engine.showText("You step inside her cozy living room.");
        await engine.showText("'Make yourself comfortable! Would you like some coffee or tea?'", state.neighbor.name);
        
        await engine.showChoices([
          { text: 'Accept coffee', branch: 'coffee' },
          { text: 'Just chat', branch: 'chat' },
          { text: 'Compliment her home', branch: 'compliment' }
        ]);
      }
    },
    
    coffee: {
      async execute(engine, state) {
        await engine.showText("'Coffee would be great, thank you!'", state.player.name);
        await engine.showText("She bustles around preparing coffee while chatting.");
        await engine.showText("'So how are you settling in? Everything going well?'", state.neighbor.name);
        await engine.showText("You spend a pleasant hour chatting over coffee.");
        
        // Good relationship boost for spending quality time
        state.neighbor.relation = Math.min(state.neighbor.relation + 5, 100);
        state.player.energy = Math.min(state.player.energy + 10, 100);
        
        // Check for relationship status upgrade
        if (state.neighbor.relation > 80) {
          state.neighbor.relationshipStatus = 'close_friend';
          await engine.showText("You feel like you've become really close friends!", "System");
        }
        
        state.player.daily.visitedNeighbor = true;
        state.player.daily.hadCoffee = true; // Coffee with neighbor counts too
        TimeHelper.jump(state.gameTime, 1);
        
        await engine.showText(`Relationship: ${state.neighbor.relation}/100 | Energy restored!`, "System");
      }
    },
    
    chat: {
      async execute(engine, state) {
        await engine.showText("You settle into comfortable conversation.");
        await engine.showText("She tells you about local events and shares neighborhood gossip.");
        await engine.showText("'There's a farmer's market on Saturdays, and the park has nice walking trails.'", state.neighbor.name);
        
        state.neighbor.relation = Math.min(state.neighbor.relation + 3, 100);
        state.player.daily.visitedNeighbor = true;
        TimeHelper.jump(state.gameTime, 1);
        
        await engine.showText("You learned more about the area and strengthened your friendship.", "System");
      }
    },
    
    compliment: {
      async execute(engine, state) {
        await engine.showText("'Your home is really lovely. It feels so warm and welcoming!'", state.player.name);
        await engine.showText("She beams with pride.");
        await engine.showText("'Thank you! I've put a lot of work into making it cozy. You have good taste!'", state.neighbor.name);
        
        state.neighbor.relation = Math.min(state.neighbor.relation + 4, 100);
        state.player.daily.visitedNeighbor = true;
        TimeHelper.jump(state.gameTime, 1);
        
        await engine.showText("Your compliment was well-received!", "System");
      }
    },
    
    doorway_chat: {
      async execute(engine, state) {
        await engine.showText("'I don't want to intrude, but it's nice to catch up!'", state.player.name);
        await engine.showText("'No worries at all! I always have time for a good neighbor.'", state.neighbor.name);
        await engine.showText("You chat for a while at the doorway about daily life.");
        
        state.neighbor.relation = Math.min(state.neighbor.relation + 2, 100);
        state.player.daily.visitedNeighbor = true;
        TimeHelper.jump(state.gameTime, 1);
        
        await engine.showText("A pleasant conversation!", "System");
      }
    },
    
    offer_help: {
      async execute(engine, state) {
        await engine.showText("'Is there anything I can help you with today?'", state.player.name);
        await engine.showText("Her face lights up.");
        await engine.showText("'Actually, I could use help moving some furniture. Would you mind?'", state.neighbor.name);
        
        await engine.showChoices([
          { text: 'Gladly help with furniture', branch: 'help_furniture' },
          { text: 'Offer to help another time', branch: 'help_later' }
        ]);
      }
    },
    
    help_furniture: {
      async execute(engine, state) {
        await engine.showText("You spend the next hour helping rearrange furniture.");
        await engine.showText("'You're a lifesaver! I owe you dinner sometime.'", state.neighbor.name);
        
        // Big relationship boost for helping
        state.neighbor.relation = Math.min(state.neighbor.relation + 7, 100);
        state.player.energy = Math.max(state.player.energy - 10, 0);
        
        if (state.neighbor.relation > 80) {
          state.neighbor.relationshipStatus = 'close_friend';
          await engine.showText("Your helpful nature has made you close friends!", "System");
        }
        
        state.player.daily.visitedNeighbor = true;
        state.player.daily.exercised = true; // Moving furniture counts as exercise
        TimeHelper.jump(state.gameTime, 1);
        
        await engine.showText(`Big relationship boost! (${state.neighbor.relation}/100)`, "System");
      }
    },
    
    help_later: {
      async execute(engine, state) {
        await engine.showText("'I'd love to help, but I'm a bit busy today. Rain check?'", state.player.name);
        await engine.showText("'Of course! Thanks for offering though.'", state.neighbor.name);
        
        state.neighbor.relation = Math.min(state.neighbor.relation + 1, 100);
        state.player.daily.visitedNeighbor = true;
        TimeHelper.jump(state.gameTime, 1);
        
        await engine.showText("She appreciates the offer, even if you can't help right now.", "System");
      }
    }
  }
};

export default knockDoorFriend;