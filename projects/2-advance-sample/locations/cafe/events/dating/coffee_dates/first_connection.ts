import type { VNEvent, GameState, EngineAPI } from '@generate/types';
import { RelationManager, StatManager, MoneyManager } from '@generate/engine';

export default {
  name: 'First Connection with Maya',
  foreground: 'assets/images/background/cafe/day.png',
  
  conditions: (state: GameState) => state.flags.maya_first_connection === true,
  unlocked: (state: GameState) => true,   
  locked: (state: GameState) => false,    
  
  async execute(engine: EngineAPI, state: GameState) {
    state.flags.maya_first_connection = false;
    
    const relationshipLevel = state.barista.relationship;
    
    await engine.showText("You decide to have your coffee here today instead of taking it to go.");
    await engine.showText("Maya notices you settling into a corner table with your drink.");
    
    if (relationshipLevel === 'stranger' || relationshipLevel === 'acquaintance') {
      await engine.jump('first-connection-early');
    } else {
      await engine.jump('first-connection-established');
    }
  },
  
  branches: {
    'first-connection-early': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("Maya wipes down the counter nervously, glancing over at you several times.");
        await engine.showText(`"Everything okay with your coffee?"` + ` she asks, approaching your table during a lull.`);
        
        await engine.showChoices([
          { text: 'Perfect, just like the person who made it', branch: 'early-flirty-compliment' },
          { text: 'Actually, I was hoping you might join me', branch: 'early-invite-sit' },
          { text: 'I wanted to get to know the talented barista better', branch: 'early-get-to-know' }
        ]);
      }
    },
    
    'early-flirty-compliment': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"Oh!"` + ` Maya's eyes widen and she blushes deeply.`);
        await engine.showText(`"That's... that's really sweet of you to say."`, "Maya");
        await engine.showText("She fidgets with her apron strings, clearly flustered but pleased.");
        await engine.showText(`"Can I... can I sit with you for a minute? It's quiet right now."`, "Maya");
        
        RelationManager.addRelation(state.barista, 4);
        StatManager.addLust(state, 3);
        
        await engine.showChoices([
          { text: 'I was hoping you\'d ask', branch: 'early-sit-together' },
          { text: 'I\'d be honored by your company', branch: 'early-sit-together' },
          { text: 'Please, I\'d love that', branch: 'early-sit-together' }
        ]);
      }
    },
    
    'early-invite-sit': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"Join you? I... well, I suppose I could take a quick break."`, "Maya");
        await engine.showText("Maya looks around the nearly empty cafe and makes her decision.");
        await engine.showText(`"Let me just put up a 'back in 5 minutes' sign."`, "Maya");
        
        RelationManager.addRelation(state.barista, 3);
        StatManager.addLust(state, 2);
        
        await engine.jump('early-sit-together');
      }
    },
    
    'early-sit-together': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("Maya sits across from you, her hands wrapped around a cup of tea.");
        await engine.showText(`"I have to admit, I was hoping someone would actually stay and chat today."`, "Maya");
        await engine.showText(`"Most people just grab their coffee and run. It gets a bit lonely."`, "Maya");
        
        await engine.showChoices([
          { text: 'Well, you have me now', branch: 'early-have-me-now' },
          { text: 'I can\'t imagine anyone wanting to rush away from you', branch: 'early-cant-imagine-rushing' },
          { text: 'Tell me about yourself, Maya', branch: 'early-tell-me-about' }
        ]);
      }
    },
    
    'early-have-me-now': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"Yes, I do,"` + ` Maya says softly, meeting your eyes.`);
        await engine.showText("There's a moment of comfortable silence as you both sip your drinks.");
        await engine.showText(`"You know, I've been working here for two years, and I can count on one hand the number of real conversations I've had."`, "Maya");
        
        RelationManager.addRelation(state.barista, 3);
        StatManager.addLust(state, 4);
        
        await engine.showText(`"But talking with you... it feels natural. Easy."`, "Maya");
        await engine.showText("She reaches across the table and briefly touches your hand.");
        
        StatManager.addLust(state, 6);
        state.flags.maya_natural_connection = true;
        
        await engine.showChoices([
          { text: 'I feel that connection too', branch: 'early-mutual-connection' },
          { text: 'Turn your hand to hold hers', branch: 'early-hold-hand' },
          { text: 'You make it easy to open up', branch: 'early-easy-open-up' }
        ]);
      }
    },
    
    'early-hold-hand': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("You turn your hand palm-up and gently intertwine your fingers with Maya's.");
        await engine.showText(`"Your hands are so warm,"` + ` she whispers.`);
        await engine.showText("Neither of you pulls away. The connection feels electric and natural at the same time.");
        
        await engine.showText(`"I should probably get back to work, but... I don't want this moment to end."`, "Maya");
        
        StatManager.addLust(state, 8);
        RelationManager.addRelation(state.barista, 5);
        state.flags.maya_hand_holding = true;
        
        await engine.showChoices([
          { text: 'Then let\'s make sure it\'s not the last', branch: 'early-not-the-last' },
          { text: 'When do you get off work?', branch: 'early-when-off-work' },
          { text: 'This is just the beginning for us', branch: 'early-just-beginning' }
        ]);
      }
    },
    
    'early-when-off-work': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"I... I close at 8 PM today,"` + ` Maya says, her voice barely above a whisper.`);
        await engine.showText(`"Why do you ask?"`, "Maya");
        await engine.showText("Her eyes search your face hopefully.");
        
        await engine.showChoices([
          { text: 'I\'d love to continue this conversation somewhere quieter', branch: 'early-continue-elsewhere' },
          { text: 'Maybe we could grab dinner together?', branch: 'early-dinner-suggestion' },
          { text: 'I want to spend more time with you', branch: 'early-more-time' }
        ]);
      }
    },
    
    'early-continue-elsewhere': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"I... I'd really like that,"` + ` Maya says with a growing smile.`);
        await engine.showText(`"There's a little park nearby with a beautiful view of the sunset."`, "Maya");
        await engine.showText(`"Would you like to meet me there after work?"`, "Maya");
        
        state.flags.maya_park_date_planned = true;
        StatManager.addLust(state, 6);
        RelationManager.addRelation(state.barista, 4);
        
        await engine.showText("You both exchange phone numbers, and Maya's smile doesn't leave her face for the rest of your visit.");
      }
    },
    
    'first-connection-established': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"Mind if I join you, ${state.player.name}?"` + ` Maya asks with a confident smile.`);
        await engine.showText("She's already bringing over her own coffee and settling into the chair across from you.");
        await engine.showText(`"I've been looking forward to some one-on-one time with you all day."`, "Maya");
        
        RelationManager.addRelation(state.barista, 2);
        StatManager.addLust(state, 4);
        
        await engine.showChoices([
          { text: 'I love how direct you are', branch: 'established-love-directness' },
          { text: 'The feeling is mutual', branch: 'established-mutual-feeling' },
          { text: 'You\'ve been thinking about me?', branch: 'established-thinking-about-me' }
        ]);
      }
    },
    
    'established-thinking-about-me': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"More than I probably should,"` + ` Maya admits with a playful grin.`);
        await engine.showText(`"You have this way of making even the most ordinary moments feel special."`, "Maya");
        await engine.showText("She leans forward, resting her chin on her hand as she studies your face.");
        
        StatManager.addLust(state, 6);
        RelationManager.addRelation(state.barista, 4);
        
        await engine.showText(`"I keep wondering what it would be like to spend a whole evening with you, away from all this."`, "Maya");
        
        await engine.showChoices([
          { text: 'Let\'s find out tonight', branch: 'established-tonight-suggestion' },
          { text: 'I\'ve been wondering the same thing', branch: 'established-same-wondering' },
          { text: 'You make ordinary moments extraordinary', branch: 'established-extraordinary-compliment' }
        ]);
      }
    },
    
    'established-tonight-suggestion': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"Tonight?"` + ` Maya's eyes light up with excitement.`);
        await engine.showText(`"I was hoping you'd say something like that. I have the perfect idea."`, "Maya");
        await engine.showText(`"There's this amazing little jazz club downtown. Very intimate, great atmosphere."`, "Maya");
        
        await engine.showText(`"Would you like to take me there? I promise to make it worth your while."`, "Maya");
        
        state.flags.maya_jazz_club_date = true;
        StatManager.addLust(state, 8);
        RelationManager.addRelation(state.barista, 5);
        
        await engine.showText("The anticipation of your evening together fills the air between you with electric tension.");
      }
    }
  }
} satisfies VNEvent;