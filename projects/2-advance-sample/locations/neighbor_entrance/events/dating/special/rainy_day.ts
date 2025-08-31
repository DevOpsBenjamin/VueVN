import type { VNEvent } from '@generate/types';
import { RelationManager, StatManager } from '@generate/engine';

const rainyDay: VNEvent = {
  name: 'Rainy Day with Sarah',
  foreground: 'assets/images/background/neighbor/entrance_rain.png',
  conditions: (state) => state.flags.sarah_rainy_day === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.sarah_rainy_day = false;
    
    const relationshipLevel = state.neighbor.relationship;
    
    await engine.showText("Heavy rain begins to fall as you approach Sarah's house.");
    await engine.showText("You can see warm light glowing from her windows, creating a cozy atmosphere against the storm.");
    
    if (relationshipLevel === 'stranger' || relationshipLevel === 'acquaintance') {
      await engine.jump('rainy-early-relationship');
    } else if (relationshipLevel === 'friend') {
      await engine.jump('rainy-friend-level');
    } else if (relationshipLevel === 'close_friend') {
      await engine.jump('rainy-intimate-level');
    }
  },
  
  branches: {
    'rainy-early-relationship': {
      async execute(engine, state) {
        await engine.showText("You hesitate at Sarah's door, soaked from the sudden downpour.");
        await engine.showText("Before you can knock, the door opens.");
        await engine.showText(`"Oh my goodness! You're absolutely drenched! Come in, come in!"`, "Sarah");
        
        await engine.showText("Sarah pulls you inside without hesitation, her natural kindness overriding any awkwardness.");
        
        RelationManager.addRelation(state.neighbor, 3);
        
        await engine.showChoices([
          { text: 'I\'m sorry for showing up like this', branch: 'early-apologetic' },
          { text: 'Thank you for rescuing me', branch: 'early-grateful' },
          { text: 'I couldn\'t stay away, even in this weather', branch: 'early-romantic-confession' }
        ]);
      }
    },
    
    'early-grateful': {
      async execute(engine, state) {
        await engine.showText(`"Nonsense! I couldn't leave you out there in this storm."`, "Sarah");
        await engine.showText("Sarah disappears and returns with a warm towel and a steaming mug of hot chocolate.");
        await engine.showText(`"This will warm you right up. I was just making some for myself anyway."`, "Sarah");
        
        await engine.showText("You spend the afternoon talking by her fireplace, watching the rain through her windows.");
        await engine.showText("The forced intimacy of the situation brings you closer together naturally.");
        
        RelationManager.addRelation(state.neighbor, 5);
        StatManager.addEnergy(state, 15);
        StatManager.addLust(state, 4);
        
        await engine.showChoices([
          { text: 'This is the most perfect afternoon I\'ve had in ages', branch: 'early-perfect-afternoon' },
          { text: 'I love how cozy and warm your home feels', branch: 'early-cozy-home' },
          { text: 'The storm brought me something wonderful - time with you', branch: 'early-storm-wonderful' }
        ]);
      }
    },
    
    'rainy-friend-level': {
      async execute(engine, state) {
        await engine.showText("Through the rain-streaked window, you see Sarah watching for you with obvious concern.");
        await engine.showText("She opens the door before you reach it, immediately wrapping you in a warm towel she had ready.");
        await engine.showText(`"I was so worried about you being out in this weather! I've been watching the road for you."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 3);
        StatManager.addLust(state, 5);
        
        await engine.showChoices([
          { text: 'You were watching for me?', branch: 'friend-watching-for-me' },
          { text: 'I love how you take care of me', branch: 'friend-love-care' },
          { text: 'Hold her close to warm yourself', branch: 'friend-hold-close-warmth' }
        ]);
      }
    },
    
    'friend-hold-close-warmth': {
      async execute(engine, state) {
        await engine.showText("You pull Sarah into a warm embrace, both seeking and offering comfort from the storm.");
        await engine.showText(`"Mmm, you're so warm,"` + ` you murmur into her hair.`);
        await engine.showText(`"And you're so cold! Let's get you properly warmed up,"` + ` she says softly.`);
        
        await engine.showText("Sarah leads you to her couch and wraps you both in a large blanket.");
        await engine.showText("Sitting close together, sharing warmth while the storm rages outside, feels incredibly intimate.");
        
        StatManager.addLust(state, 8);
        RelationManager.addRelation(state.neighbor, 4);
        
        await engine.showChoices([
          { text: 'Kiss her gently while you\'re so close', branch: 'friend-gentle-kiss' },
          { text: 'This feels so right, being here with you', branch: 'friend-feels-right' },
          { text: 'I wish this storm would last all night', branch: 'friend-wish-storm-lasted' }
        ]);
      }
    },
    
    'friend-gentle-kiss': {
      async execute(engine, state) {
        await engine.showText("You lean in and kiss Sarah softly, the intimacy of the moment making it feel natural and right.");
        await engine.showText("She responds warmly, her hand coming up to cup your cheek.");
        await engine.showText(`"I've been hoping you'd do that,"` + ` she whispers against your lips.`);
        
        await engine.showText("The kiss deepens as the rain provides a romantic soundtrack to your growing closeness.");
        
        StatManager.addLust(state, 12);
        RelationManager.addRelation(state.neighbor, 6);
        state.flags.sarah_rainy_kiss = true;
        
        await engine.showChoices([
          { text: 'The rain made me realize how much I want to be close to you', branch: 'friend-rain-realization' },
          { text: 'You\'re all the warmth I need', branch: 'friend-warmth-needed' },
          { text: 'Continue kissing her passionately', branch: 'friend-passionate-kissing' }
        ]);
      }
    },
    
    'rainy-intimate-level': {
      async execute(engine, state) {
        await engine.showText("Sarah is already at the door with a robe and towel when you arrive, soaked from the storm.");
        await engine.showText(`"I knew you'd come to me in this weather. You always do when you need comfort,"` + ` she says lovingly.`);
        await engine.showText("She immediately begins helping you out of your wet clothes with caring, intimate familiarity.");
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 8);
        
        await engine.showChoices([
          { text: 'You know me so well', branch: 'intimate-know-me-well' },
          { text: 'I always want to come home to you', branch: 'intimate-come-home' },
          { text: 'Let her continue undressing you', branch: 'intimate-let-undress' }
        ]);
      }
    },
    
    'intimate-let-undress': {
      async execute(engine, state) {
        await engine.showText("Sarah's hands are gentle but sure as she helps you out of your wet clothes.");
        await engine.showText(`"We need to get you warmed up properly,"` + ` she says with obvious care and desire.`);
        await engine.showText("Her touch lingers longer than necessary, her eyes dark with wanting.");
        
        await engine.showText("She wraps the soft robe around you, her hands trailing over your skin as she does.");
        
        StatManager.addLust(state, 15);
        
        await engine.showChoices([
          { text: 'I need you to warm me up', branch: 'intimate-need-warming' },
          { text: 'The storm outside has nothing on the fire between us', branch: 'intimate-fire-between' },
          { text: 'Pull her into the shower with you', branch: 'intimate-shower-together' }
        ]);
      }
    },
    
    'intimate-shower-together': {
      async execute(engine, state) {
        await engine.showText(`"Now that's the best idea I've heard all day,"` + ` Sarah purrs.`);
        await engine.showText("She leads you to her bathroom where steam is already beginning to fog the mirrors.");
        await engine.showText("Under the hot water, with the storm raging outside, you lose yourselves in passionate intimacy...");
        
        await engine.showText("Hours later, wrapped together in warm towels, you listen to the rain still falling softly outside.");
        await engine.showText(`"Every storm should end like this,"` + ` Sarah sighs contentedly against your chest.`);
        
        StatManager.addLust(state, 20);
        StatManager.addEnergy(state, 25);
        state.flags.sarah_rainy_intimate = true;
      }
    }
  }
};

export default rainyDay;