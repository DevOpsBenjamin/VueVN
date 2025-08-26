import type { VNEvent } from '@generate/types';
import { TimeHelper } from '@generate/engine';

const knockDoorLover: VNEvent = {
  name: 'Knock Door - Lover',
  foreground: 'assets/images/background/neighbor/entrance.png',
  conditions: () => false, // Never triggers directly - only via jump
  unlocked: (state) => true,
  locked: (state) => false,
  
  async execute(engine, state) {
    await engine.showText("The door opens almost immediately...");
    
    // Add neighbor in attractive silk robe
    engine.addForeground('assets/images/characters/neighbor/silk_robe.png');
    
    await engine.showText(`"${state.player.name}! I was hoping you'd come by."`, state.neighbor.name);
    await engine.showText("She's wearing a silk robe that catches the light beautifully.");
    await engine.showText("Her smile is warm and inviting, with a hint of mischief in her eyes.");
    
    // Small lust increase from the sight
    state.player.lust = Math.min(state.player.lust + 3, 100);
    
    await engine.showChoices([
      { text: 'Compliment how she looks', branch: 'compliment' },
      { text: 'Ask if you can come in', branch: 'ask_enter' },
      { text: 'Suggest doing something together', branch: 'suggest_activity' }
    ]);
  },

  branches: {
    compliment: {
      async execute(engine, state) {
        await engine.showText("'You look absolutely stunning today.'", state.player.name);
        await engine.showText("She blushes and does a little twirl.");
        await engine.showText("'You always know just what to say. Come here...'", state.neighbor.name);
        
        // She pulls you close for an intimate moment
        await engine.showText("She pulls you close and gives you a soft, lingering kiss.");
        
        state.player.lust = Math.min(state.player.lust + 5, 100);
        state.neighbor.relation = Math.min(state.neighbor.relation + 3, 100);
        
        await engine.showText("'Want to come inside for some... privacy?'", state.neighbor.name);
        
        await engine.showChoices([
          { text: 'Accept her invitation', branch: 'private_time' },
          { text: 'Suggest a romantic walk instead', branch: 'romantic_walk' },
          { text: 'Say you should take things slow', branch: 'take_slow' }
        ]);
      }
    },
    
    private_time: {
      async execute(engine, state) {
        // Change to bedroom scene
        engine.setForeground(['assets/images/background/neighbor/bedroom.png']);
        engine.addForeground('assets/images/characters/neighbor/silk_robe.png');
        
        await engine.showText("She leads you to her bedroom, her hand intertwined with yours.");
        await engine.showText("The afternoon sunlight filters through sheer curtains.");
        await engine.showText("'I've been thinking about you all day...'", state.neighbor.name);
        
        // Intimate scene (keeping it tasteful)
        await engine.showText("You spend a passionate hour together, growing even closer.");
        await engine.showText("Afterwards, you lie together talking softly.");
        
        // Major relationship and lust changes
        state.neighbor.relation = Math.min(state.neighbor.relation + 8, 100);
        state.player.lust = Math.max(state.player.lust - 30, 0); // Satisfied
        state.player.energy = Math.max(state.player.energy - 15, 10);
        
        state.player.daily.visitedNeighbor = true;
        state.player.daily.intimateTime = true;
        TimeHelper.jump(state.gameTime, 2); // Takes longer
        
        await engine.showText("Your bond has deepened significantly.", "System");
        await engine.showText(`Relationship: ${state.neighbor.relation}/100 | Lust satisfied`, "System");
      }
    },
    
    romantic_walk: {
      async execute(engine, state) {
        await engine.showText("'Actually, would you like to go for a walk? It's a beautiful day.'", state.player.name);
        await engine.showText("'That sounds lovely! Give me a moment to change.'", state.neighbor.name);
        
        // Scene change to park
        engine.setForeground(['assets/images/background/park/path.png']);
        engine.addForeground('assets/images/characters/neighbor/casual_outfit.png');
        
        await engine.showText("You stroll through the park hand in hand.");
        await engine.showText("'I love spending time like this with you.'", state.neighbor.name);
        await engine.showText("The romantic atmosphere makes you both feel closer.");
        
        state.neighbor.relation = Math.min(state.neighbor.relation + 5, 100);
        state.player.lust = Math.min(state.player.lust + 2, 100);
        state.player.energy = Math.min(state.player.energy + 5, 100);
        
        state.player.daily.visitedNeighbor = true;
        state.player.daily.exercised = true;
        TimeHelper.jump(state.gameTime, 1);
        
        await engine.showText("A perfect romantic walk together!", "System");
      }
    },
    
    take_slow: {
      async execute(engine, state) {
        await engine.showText("'I care about you so much. Maybe we should take things slow?'", state.player.name);
        await engine.showText("She smiles understandingly.");
        await engine.showText("'You're right. I appreciate how thoughtful you are.'", state.neighbor.name);
        await engine.showText("'How about we just cuddle and watch a movie?'", state.neighbor.name);
        
        // Cozy indoor scene
        engine.setForeground(['assets/images/background/neighbor/living_room.png']);
        engine.addForeground('assets/images/characters/neighbor/comfortable_clothes.png');
        
        await engine.showText("You spend a cozy afternoon together on the couch.");
        
        state.neighbor.relation = Math.min(state.neighbor.relation + 4, 100);
        state.player.energy = Math.min(state.player.energy + 10, 100);
        
        state.player.daily.visitedNeighbor = true;
        TimeHelper.jump(state.gameTime, 2);
        
        await engine.showText("Sometimes the simple moments are the most meaningful.", "System");
      }
    },
    
    ask_enter: {
      async execute(engine, state) {
        await engine.showText("'May I come in? I'd love to spend some time with you.'", state.player.name);
        await engine.showText("'Always! My home is your home.'", state.neighbor.name);
        
        engine.setForeground(['assets/images/background/neighbor/living_room.png']);
        engine.addForeground('assets/images/characters/neighbor/silk_robe.png');
        
        await engine.showText("You settle in together, enjoying each other's company.");
        await engine.showText("The conversation flows naturally between playful teasing and deep talks.");
        
        state.neighbor.relation = Math.min(state.neighbor.relation + 4, 100);
        state.player.lust = Math.min(state.player.lust + 2, 100);
        
        state.player.daily.visitedNeighbor = true;
        TimeHelper.jump(state.gameTime, 1);
        
        await engine.showText("Quality time with someone special.", "System");
      }
    },
    
    suggest_activity: {
      async execute(engine, state) {
        await engine.showText("'Want to do something fun together today?'", state.player.name);
        await engine.showText("'I'm up for anything with you! What did you have in mind?'", state.neighbor.name);
        
        await engine.showChoices([
          { text: 'Cook dinner together', branch: 'cook_together' },
          { text: 'Go shopping downtown', branch: 'go_shopping' },
          { text: 'Have a picnic in the garden', branch: 'garden_picnic' }
        ]);
      }
    },
    
    cook_together: {
      async execute(engine, state) {
        engine.setForeground(['assets/images/background/neighbor/kitchen.png']);
        engine.addForeground('assets/images/characters/neighbor/apron.png');
        
        await engine.showText("You spend the evening cooking a delicious meal together.");
        await engine.showText("'You're quite the chef! This is so much fun.'", state.neighbor.name);
        await engine.showText("Working as a team in the kitchen brings you closer together.");
        
        state.neighbor.relation = Math.min(state.neighbor.relation + 6, 100);
        state.player.energy = Math.min(state.player.energy + 15, 100); // Good meal
        
        state.player.daily.visitedNeighbor = true;
        TimeHelper.jump(state.gameTime, 2);
        
        await engine.showText("Nothing beats a home-cooked meal with someone special!", "System");
      }
    },
    
    go_shopping: {
      async execute(engine, state) {
        engine.setForeground(['assets/images/background/city/shopping_district.png']);
        engine.addForeground('assets/images/characters/neighbor/casual_outfit.png');
        
        await engine.showText("You spend the afternoon shopping together downtown.");
        await engine.showText("She helps you pick out some new clothes, and you help her choose accessories.");
        await engine.showText("'I love how we have similar tastes!'", state.neighbor.name);
        
        state.neighbor.relation = Math.min(state.neighbor.relation + 4, 100);
        state.player.pocketMoney = Math.max(state.player.pocketMoney - 20, 0);
        
        state.player.daily.visitedNeighbor = true;
        TimeHelper.jump(state.gameTime, 3);
        
        await engine.showText("A fun shopping day together! (-$20)", "System");
      }
    },
    
    garden_picnic: {
      async execute(engine, state) {
        engine.setForeground(['assets/images/background/garden/picnic_setup.png']);
        engine.addForeground('assets/images/characters/neighbor/summer_dress.png');
        
        await engine.showText("You set up a romantic picnic in the garden.");
        await engine.showText("'This is perfect! Just you, me, and nature.'", state.neighbor.name);
        await engine.showText("The peaceful setting creates a magical atmosphere.");
        
        state.neighbor.relation = Math.min(state.neighbor.relation + 5, 100);
        state.player.lust = Math.min(state.player.lust + 3, 100);
        state.player.energy = Math.min(state.player.energy + 10, 100);
        
        state.player.daily.visitedNeighbor = true;
        TimeHelper.jump(state.gameTime, 2);
        
        await engine.showText("A romantic picnic creates beautiful memories!", "System");
      }
    }
  }
};

export default knockDoorLover;