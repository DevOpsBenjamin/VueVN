import type { VNEvent, GameState, EngineAPI } from '@generate/types';
import { RelationManager, StatManager, MoneyManager } from '@generate/engine';

export default {
  name: 'Garden Tea Time with Sarah',
  foreground: 'assets/images/background/garden/afternoon.png',
  
  conditions: (state: GameState) => {
    const hour = state.gameTime.hour;
    return state.flags.sarah_garden_tea === true && hour >= 14 && hour <= 17;
  },
  unlocked: (state: GameState) => state.neighbor.relationship !== 'stranger',   
  locked: (state: GameState) => false,    
  
  async execute(engine: EngineAPI, state: GameState) {
    state.flags.sarah_garden_tea = false;
    
    const relationshipLevel = state.neighbor.relationship;
    
    await engine.showText("You find Sarah in her garden, tending to her flowers in the warm afternoon sun.");
    await engine.showText("She's wearing a flowing sundress and a wide-brimmed hat that perfectly frames her face.");
    
    await engine.showText(`"Perfect timing! I was just about to take a tea break."`, "Sarah");
    await engine.showText("She gestures to a small table set with an elegant tea service under a flowering arbor.");
    
    if (relationshipLevel === 'acquaintance' || relationshipLevel === 'friend') {
      await engine.jump('tea-developing');
    } else {
      await engine.jump('tea-intimate');
    }
  },
  
  branches: {
    'tea-developing': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"I made chamomile tea from my own flowers,"` + ` Sarah says proudly.`);
        await engine.showText("She pours you a cup, her movements graceful and deliberate.");
        await engine.showText(`"There's something so peaceful about sharing tea in the garden. It makes time slow down."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 3);
        
        await engine.showChoices([
          { text: 'You make everything more beautiful', branch: 'tea-everything-beautiful' },
          { text: 'I love how you find peace in simple moments', branch: 'tea-love-peace' },
          { text: 'Your garden is like a secret paradise', branch: 'tea-secret-paradise' }
        ]);
      }
    },
    
    'tea-everything-beautiful': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"That's... that's such a lovely thing to say,"` + ` Sarah blushes, setting down her teacup.`);
        await engine.showText("A soft breeze stirs her dress and the scent of jasmine fills the air between you.");
        await engine.showText(`"You know, I've been gardening for years, but it never felt special until you started visiting."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 4);
        StatManager.addLust(state, 5);
        
        await engine.showChoices([
          { text: 'Everything feels special when I\'m with you', branch: 'tea-feels-special' },
          { text: 'You inspire me to see beauty everywhere', branch: 'tea-inspire-beauty' },
          { text: 'Reach out and touch her hand', branch: 'tea-touch-hand' }
        ]);
      }
    },
    
    'tea-touch-hand': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("You reach across the small table and gently take Sarah's hand in yours.");
        await engine.showText(`"Your hands are so gentle, like your whole spirit,"` + ` she says softly.`);
        await engine.showText("She turns her palm up to intertwine your fingers, her thumb stroking your skin.");
        
        await engine.showText(`"I feel so... connected to you here in my garden. Like you belong here."`, "Sarah");
        
        StatManager.addLust(state, 7);
        RelationManager.addRelation(state.neighbor, 5);
        
        await engine.showChoices([
          { text: 'I want to belong wherever you are', branch: 'tea-belong-wherever' },
          { text: 'This feels like our special place', branch: 'tea-our-special-place' },
          { text: 'Bring her hand to your lips', branch: 'tea-kiss-hand' }
        ]);
      }
    },
    
    'tea-kiss-hand': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("You lift Sarah's hand to your lips and place a tender kiss on her knuckles.");
        await engine.showText(`"Oh my,"` + ` she breathes, her eyes fluttering closed.`);
        await engine.showText(`"That's so romantic. I feel like I'm in a fairy tale."`, "Sarah");
        
        await engine.showText("The afternoon sun filters through the arbor, creating dappled patterns of light and shadow across your joined hands.");
        
        StatManager.addLust(state, 9);
        RelationManager.addRelation(state.neighbor, 6);
        state.flags.sarah_garden_romance = true;
        
        await engine.showChoices([
          { text: 'You deserve to be treated like a fairy tale princess', branch: 'tea-fairy-tale-princess' },
          { text: 'Every moment with you is magical', branch: 'tea-every-moment-magical' },
          { text: 'Stand and offer to dance with her in the garden', branch: 'tea-garden-dance' }
        ]);
      }
    },
    
    'tea-garden-dance': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("You stand and extend your hand to Sarah with an elegant bow.");
        await engine.showText(`"A dance? Here in the garden?"` + ` she laughs delightedly.`);
        await engine.showText(`"I can't think of anything more perfect."`, "Sarah");
        
        await engine.showText("Sarah takes your hand and you begin to sway together among the flowers, with only birdsong as your music.");
        await engine.showText("She rests her head against your chest as you hold her close, the world fading away.");
        
        StatManager.addLust(state, 12);
        RelationManager.addRelation(state.neighbor, 7);
        state.flags.sarah_garden_dance = true;
        
        await engine.showText(`"This is the most romantic afternoon of my entire life,"` + ` Sarah whispers.`);
      }
    },
    
    'tea-intimate': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"I've been waiting for you, darling,"` + ` Sarah says with a knowing smile.`);
        await engine.showText("She approaches you with feline grace and immediately wraps her arms around your neck.");
        
        await engine.showText(`"I have the perfect afternoon planned for us. Tea, sunshine, and privacy."`, "Sarah");
        await engine.showText("She leads you to a secluded corner of the garden hidden behind tall sunflowers.");
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 6);
        
        await engine.showChoices([
          { text: 'I love your secret garden spots', branch: 'tea-secret-spots' },
          { text: 'Privacy sounds perfect', branch: 'tea-privacy-perfect' },
          { text: 'Kiss her passionately among the sunflowers', branch: 'tea-sunflower-kiss' }
        ]);
      }
    },
    
    'tea-sunflower-kiss': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("You pull Sarah into a deep, passionate kiss surrounded by the towering sunflowers.");
        await engine.showText(`"Mmm, I love how you take charge,"` + ` she purrs against your lips.`);
        await engine.showText("Her hands tangle in your hair as she presses her body against yours.");
        
        await engine.showText(`"The neighbors can't see us here. We can be as... intimate as we want."`, "Sarah");
        
        StatManager.addLust(state, 15);
        RelationManager.addRelation(state.neighbor, 4);
        
        await engine.showChoices([
          { text: 'Show me just how intimate', branch: 'tea-show-intimate' },
          { text: 'I want you right here in your garden', branch: 'tea-want-here' },
          { text: 'Let\'s make this afternoon unforgettable', branch: 'tea-unforgettable' }
        ]);
      }
    },
    
    'tea-show-intimate': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"With pleasure,"` + ` Sarah whispers seductively.`);
        await engine.showText("She begins to slowly unbutton your shirt, her eyes never leaving yours.");
        
        await engine.showText("The warm afternoon sun, the scent of flowers, and Sarah's passionate touch create an intoxicating combination.");
        await engine.showText("You lose yourselves in desire among the secret garden blooms...");
        
        StatManager.addLust(state, 20);
        state.flags.sarah_garden_intimacy = true;
        
        await engine.showText("Later, as you both straighten your clothes, Sarah serves the now-cold tea with a satisfied smile.");
        await engine.showText(`"Best tea break ever,"` + ` she says with a wicked grin.`);
      }
    }
  }
} satisfies VNEvent;