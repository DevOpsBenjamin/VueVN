import type { VNEvent } from '@generate/types';
import { RelationManager, StatManager } from '@generate/engine';

const gardenTogether: VNEvent = {
  name: 'Morning Garden Time with Sarah',
  foreground: 'assets/images/background/neighbor/garden.png',
  conditions: (state) => state.flags.sarah_garden_morning === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.sarah_garden_morning = false;
    
    const relationshipLevel = state.neighbor.relationship;
    const hasInteractedToday = RelationManager.hasInteractedToday(state, 'neighbor');
    
    if (hasInteractedToday) {
      await engine.showText("You've already spent quality time with Sarah today.");
      return;
    }
    
    await engine.showText("You find Sarah tending to her morning garden, watering her flowers in the gentle sunlight.");
    await engine.showText(`"Oh! ${state.player.name}, you startled me! But in a good way."`, "Sarah");
    
    if (relationshipLevel === 'stranger' || relationshipLevel === 'acquaintance') {
      await engine.jump('garden-early-relationship');
    } else if (relationshipLevel === 'friend') {
      await engine.jump('garden-friend-level');
    } else if (relationshipLevel === 'close_friend') {
      await engine.jump('garden-intimate-level');
    }
  },
  
  branches: {
    'garden-early-relationship': {
      async execute(engine, state) {
        await engine.showText(`"I love spending my mornings out here. There's something magical about watching things grow."`, "Sarah");
        await engine.showText("Sarah gestures to her carefully tended flower beds with obvious pride.");
        
        RelationManager.addRelation(state.neighbor, 2);
        
        await engine.showChoices([
          { text: 'Your garden is absolutely beautiful', branch: 'early-compliment-garden' },
          { text: 'You have a real green thumb', branch: 'early-compliment-skill' },
          { text: 'Mind if I help you with that?', branch: 'early-offer-help' }
        ]);
      }
    },
    
    'early-compliment-garden': {
      async execute(engine, state) {
        await engine.showText(`"Thank you so much! I put a lot of love into it."`, "Sarah");
        await engine.showText("Sarah beams with pride, her face glowing in the morning sun.");
        await engine.showText(`"These roses are my pride and joy. They took three years to get just right."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 2);
        
        await engine.showChoices([
          { text: 'They\'re almost as beautiful as you', branch: 'early-romantic-compliment' },
          { text: 'Three years of patience - that\'s impressive', branch: 'early-admire-patience' },
          { text: 'Would you teach me about gardening?', branch: 'early-ask-teaching' }
        ]);
      }
    },
    
    'early-offer-help': {
      async execute(engine, state) {
        await engine.showText(`"Really? You'd want to help with my garden?"`, "Sarah");
        await engine.showText("Sarah looks genuinely touched by your offer.");
        await engine.showText(`"Well, I suppose I could use another pair of hands with the watering."`, "Sarah");
        
        await engine.showText("You spend the next half hour helping Sarah water her plants, working side by side in comfortable companionship.");
        
        RelationManager.addRelation(state.neighbor, 4);
        StatManager.addEnergy(state, -5); // Physical activity
        StatManager.addLust(state, 3);
        
        await engine.showChoices([
          { text: 'This was really nice. Same time tomorrow?', branch: 'early-suggest-routine' },
          { text: 'I love how peaceful this is', branch: 'early-enjoy-peace' },
          { text: 'Working with you feels natural', branch: 'early-natural-feeling' }
        ]);
      }
    },
    
    'garden-friend-level': {
      async execute(engine, state) {
        await engine.showText(`"Perfect timing! I was just thinking this garden needed some better company."`, "Sarah");
        await engine.showText("Sarah sets down her watering can and walks over to you with a warm smile.");
        await engine.showText(`"Want to help me plant these new tulip bulbs? I got them yesterday and I'm excited to see them grow."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 2);
        
        await engine.showChoices([
          { text: 'I\'d love to plant something that we can watch grow together', branch: 'friend-romantic-planting' },
          { text: 'Absolutely! I love working alongside you', branch: 'friend-enjoy-together' },
          { text: 'What colors will they be?', branch: 'friend-curious-colors' }
        ]);
      }
    },
    
    'friend-romantic-planting': {
      async execute(engine, state) {
        await engine.showText(`"That's... that's such a sweet way to put it,"` + ` Sarah says softly.`);
        await engine.showText("Her eyes meet yours with a deeper warmth than usual.");
        await engine.showText("You kneel side by side, planting bulbs while your hands occasionally brush against each other.");
        
        await engine.showText(`"These tulips will bloom in spring. Every time I see them, I'll think of this moment with you."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 4);
        StatManager.addLust(state, 5);
        state.flags.sarah_tulips_planted = true;
        
        await engine.showChoices([
          { text: 'And I\'ll think of how beautiful you look right now', branch: 'friend-beautiful-moment' },
          { text: 'Maybe by spring, we\'ll have grown closer too', branch: 'friend-hope-closer' },
          { text: 'Take my hand while we work', branch: 'friend-hold-hands' }
        ]);
      }
    },
    
    'garden-intimate-level': {
      async execute(engine, state) {
        await engine.showText(`"Mmm, my favorite person at my favorite time of day,"` + ` Sarah purrs as she sees you.`);
        await engine.showText("She abandons her gardening tools and walks over to embrace you warmly.");
        await engine.showText(`"I was hoping you'd come by. I wanted to show you something special."`, "Sarah");
        
        await engine.showText("Sarah takes your hand and leads you to a secluded corner of her garden where she's created a small intimate seating area.");
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 4);
        
        await engine.showChoices([
          { text: 'This is incredibly romantic', branch: 'intimate-appreciate-romance' },
          { text: 'You always know how to surprise me', branch: 'intimate-love-surprises' },
          { text: 'Kiss her among the flowers', branch: 'intimate-garden-kiss' }
        ]);
      }
    },
    
    'intimate-garden-kiss': {
      async execute(engine, state) {
        await engine.showText("You pull Sarah close among the blooming flowers and kiss her passionately.");
        await engine.showText("The morning sun warms your skin as she melts into your embrace.");
        await engine.showText(`"I love you so much,"` + ` she whispers against your lips.`);
        
        await engine.showText("The sweet scent of flowers mingles with her perfume as you hold each other close.");
        
        StatManager.addLust(state, 8);
        RelationManager.addRelation(state.neighbor, 3);
        
        await engine.showChoices([
          { text: 'I love you too, more than these flowers love the sun', branch: 'intimate-poetic-love' },
          { text: 'Let\'s stay here a little longer', branch: 'intimate-linger-garden' },
          { text: 'Should we take this inside?', branch: 'intimate-suggest-inside' }
        ]);
      }
    },
    
    'intimate-suggest-inside': {
      async execute(engine, state) {
        await engine.showText(`"Mmm, I like the way you think,"` + ` Sarah says with a sultry smile.`);
        await engine.showText("She takes your hand and leads you toward her house.");
        await engine.showText(`"The garden will still be here later. Right now, I want you all to myself."`, "Sarah");
        
        StatManager.addLust(state, 10);
        state.flags.sarah_morning_intimate = true;
        
        await engine.showText("You spend an intimate morning together, lost in each other's embrace...");
        await engine.showText("Time seems to stand still as you explore your deep connection.");
      }
    }
  }
};

export default gardenTogether;