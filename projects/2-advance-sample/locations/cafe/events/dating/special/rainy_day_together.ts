import type { VNEvent, GameState, EngineAPI } from '@generate/types';
import { RelationManager, StatManager, MoneyManager } from '@generate/engine';

export default {
  name: 'Rainy Day with Maya',
  foreground: 'assets/images/background/cafe/rainy.png',
  
  conditions: (state: GameState) => state.flags.maya_rainy_day === true,
  unlocked: (state: GameState) => state.barista.relationship !== 'stranger',   
  locked: (state: GameState) => false,    
  
  async execute(engine: EngineAPI, state: GameState) {
    state.flags.maya_rainy_day = false;
    
    await engine.showText("Heavy rain patters against the cafe windows, creating a cozy atmosphere inside.");
    await engine.showText("The cafe is nearly empty due to the weather - just you, Maya, and the sound of rain.");
    
    const relationshipLevel = state.barista.relationship;
    
    if (relationshipLevel === 'acquaintance' || relationshipLevel === 'friend') {
      await engine.jump('rainy-developing');
    } else {
      await engine.jump('rainy-intimate');
    }
  },
  
  branches: {
    'rainy-developing': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"I love days like this,"` + ` Maya says, looking out at the rain.`);
        await engine.showText(`"When the world slows down and it's just... peaceful."`, "Maya");
        await engine.showText("She dims the overhead lights and turns on some soft jazz music.");
        
        await engine.showText(`"Want to help me close up early? I don't think anyone else is coming in this weather."`, "Maya");
        
        await engine.showChoices([
          { text: 'I\'d love to help', branch: 'rainy-help-close' },
          { text: 'What did you have in mind after closing?', branch: 'rainy-what-in-mind' },
          { text: 'Just the two of us?', branch: 'rainy-just-us-two' }
        ]);
      }
    },
    
    'rainy-help-close': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("You and Maya work together to close the cafe, moving in comfortable synchronization.");
        await engine.showText("She shows you how to clean the espresso machine while she wipes down tables.");
        
        await engine.showText(`"You're a natural at this,"` + ` Maya laughs as you perfectly steam some milk.`);
        await engine.showText(`"Maybe I should hire you as my assistant."`, "Maya");
        
        RelationManager.addRelation(state.barista, 3);
        StatManager.addLust(state, 4);
        
        await engine.showChoices([
          { text: 'I\'d love to work alongside you every day', branch: 'rainy-work-alongside' },
          { text: 'I have other ideas for how we could spend time together', branch: 'rainy-other-ideas' },
          { text: 'Only if I get special employee benefits', branch: 'rainy-special-benefits' }
        ]);
      }
    },
    
    'rainy-work-alongside': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"That sounds... really nice actually,"` + ` Maya says softly.`);
        await engine.showText("She stops what she's doing and turns to face you fully.");
        await engine.showText(`"I've been alone here for so long, I forgot how good it feels to have someone to share the work with."`, "Maya");
        
        await engine.showText("The rain continues to create a cocoon of intimacy around you both.");
        
        RelationManager.addRelation(state.barista, 4);
        StatManager.addLust(state, 5);
        
        await engine.showChoices([
          { text: 'You never have to be alone again', branch: 'rainy-never-alone' },
          { text: 'I love being your partner in everything', branch: 'rainy-love-being-partner' },
          { text: 'Step closer to her', branch: 'rainy-step-closer' }
        ]);
      }
    },
    
    'rainy-step-closer': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("You move closer to Maya, close enough to see the flecks of gold in her brown eyes.");
        await engine.showText(`"The rain makes everything feel so... intimate,"` + ` she whispers.`);
        await engine.showText("Her breath mingles with yours as she doesn't step away.");
        
        await engine.showText(`"I can hear your heartbeat,"` + ` Maya says, her hand coming up to rest on your chest.`);
        
        StatManager.addLust(state, 8);
        RelationManager.addRelation(state.barista, 5);
        
        await engine.showChoices([
          { text: 'It beats faster when you\'re near', branch: 'rainy-beats-faster' },
          { text: 'Kiss her in the rain-dimmed light', branch: 'rainy-first-kiss' },
          { text: 'Place your hand over hers', branch: 'rainy-hand-over-hers' }
        ]);
      }
    },
    
    'rainy-first-kiss': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("You lean in slowly, giving Maya time to pull away if she wants to.");
        await engine.showText("Instead, she rises up on her toes to meet you halfway.");
        
        await engine.showText("Your lips meet in a soft, tentative kiss that quickly deepens with mutual desire.");
        await engine.showText(`"I've been wanting you to do that for weeks,"` + ` Maya breathes against your lips.`);
        
        StatManager.addLust(state, 12);
        RelationManager.addRelation(state.barista, 6);
        state.flags.maya_first_kiss = true;
        
        await engine.showText("The rain outside seems to intensify, as if nature itself is celebrating your first kiss.");
        
        await engine.showChoices([
          { text: 'I\'ve been wanting to kiss you since the day we met', branch: 'rainy-since-day-met' },
          { text: 'This feels so right', branch: 'rainy-feels-right' },
          { text: 'Kiss her again, deeper this time', branch: 'rainy-deeper-kiss' }
        ]);
      }
    },
    
    'rainy-deeper-kiss': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("Your second kiss is hungrier, more passionate, as all pretense falls away.");
        await engine.showText("Maya's arms wrap around your neck, pulling you closer as she presses her body against yours.");
        
        await engine.showText(`"The cafe is closed,"` + ` she whispers meaningfully against your ear.`);
        await engine.showText(`"We have all the time in the world."`, "Maya");
        
        StatManager.addLust(state, 15);
        state.flags.maya_rainy_romance = true;
        
        await engine.showText("You spend the rest of the rainy evening lost in each other's embrace, the outside world forgotten.");
      }
    },
    
    'rainy-intimate': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("Maya immediately locks the front door and flips the 'closed' sign.");
        await engine.showText(`"Perfect weather for staying in with someone special,"` + ` she says with a sultry smile.`);
        
        await engine.showText("She dims all the lights and lights several candles she keeps for ambiance.");
        await engine.showText(`"I've been fantasizing about having you all to myself on a day like this."`, "Maya");
        
        RelationManager.addRelation(state.barista, 2);
        StatManager.addLust(state, 8);
        
        await engine.showChoices([
          { text: 'Show me these fantasies', branch: 'rainy-show-fantasies' },
          { text: 'I\'m all yours today', branch: 'rainy-all-yours' },
          { text: 'Pull her into a passionate embrace', branch: 'rainy-passionate-embrace' }
        ]);
      }
    },
    
    'rainy-show-fantasies': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"Gladly,"` + ` Maya purrs, leading you to the cozy seating area.`);
        await engine.showText("She sits you down on the couch and straddles your lap facing you.");
        
        await engine.showText(`"I've imagined us here, alone, with nothing but time and desire,"` + ` she whispers.`);
        await engine.showText("Her hands trace patterns on your chest as the rain creates a romantic soundtrack.");
        
        StatManager.addLust(state, 15);
        RelationManager.addRelation(state.barista, 4);
        state.flags.maya_cafe_intimacy = true;
        
        await engine.showText("You lose yourselves in passion as the storm rages outside, making the cafe your private sanctuary.");
      }
    }
  }
} satisfies VNEvent;