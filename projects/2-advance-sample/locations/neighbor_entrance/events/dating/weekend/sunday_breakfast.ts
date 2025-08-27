import type { VNEvent } from '@generate/types';
import { RelationManager, StatManager } from '@generate/engine';

const sundayBreakfast: VNEvent = {
  name: 'Sunday Morning Breakfast with Sarah',
  foreground: 'assets/images/background/neighbor/entrance.png',
  conditions: (state) => state.flags.sarah_sunday_breakfast === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.sarah_sunday_breakfast = false;
    
    const hour = state.gameTime.hour;
    const relationshipLevel = state.neighbor.relationship;
    
    // Action unlocked conditions already ensure proper breakfast hours
    
    // Check if it's actually Sunday (day 7 of week)
    // For this example, we'll assume any weekend interaction
    
    await engine.showText("You approach Sarah's door on this lazy Sunday morning, carrying a bag of fresh pastries from the bakery.");
    await engine.showText("The sweet aroma of coffee drifts from her kitchen window.");
    
    if (relationshipLevel === 'stranger' || relationshipLevel === 'acquaintance') {
      await engine.jump('breakfast-early-relationship');
    } else if (relationshipLevel === 'friend') {
      await engine.jump('breakfast-friend-level');
    } else if (relationshipLevel === 'close_friend') {
      await engine.jump('breakfast-intimate-level');
    }
  },
  
  branches: {
    'breakfast-early-relationship': {
      async execute(engine, state) {
        await engine.showText("*knock knock*");
        await engine.showText(`"${state.player.name}? What a lovely surprise!"`, "Sarah");
        await engine.showText("Sarah opens the door in her comfortable weekend clothes, looking relaxed and beautiful.");
        await engine.showText(`"I was just making coffee. Are those pastries?"`, "Sarah");
        
        await engine.showChoices([
          { text: 'I thought you might like to share Sunday breakfast', branch: 'early-share-breakfast' },
          { text: 'Fresh from the bakery this morning', branch: 'early-fresh-pastries' },
          { text: 'I couldn\'t think of anyone I\'d rather spend Sunday with', branch: 'early-rather-spend-with' }
        ]);
      }
    },
    
    'early-share-breakfast': {
      async execute(engine, state) {
        await engine.showText(`"That's incredibly thoughtful! Please, come in."`, "Sarah");
        await engine.showText("Sarah leads you to her sunny kitchen where she's already set out plates and coffee cups.");
        await engine.showText(`"I love lazy Sunday mornings, but they're so much better with good company."`, "Sarah");
        
        await engine.showText("You spend the morning sharing pastries, coffee, and easy conversation.");
        await engine.showText("Sarah tells you about her favorite Sunday rituals - reading, gardening, and cooking elaborate breakfasts.");
        
        RelationManager.addRelation(state.neighbor, 5);
        StatManager.addEnergy(state, 20);
        StatManager.addLust(state, 4);
        
        await engine.showChoices([
          { text: 'This is the perfect way to spend a Sunday', branch: 'early-perfect-sunday' },
          { text: 'I\'d love to make this a regular tradition', branch: 'early-regular-tradition' },
          { text: 'You make everything feel special', branch: 'early-make-special' }
        ]);
      }
    },
    
    'early-regular-tradition': {
      async execute(engine, state) {
        await engine.showText(`"A regular tradition? With me?"` + ` Sarah asks, her eyes lighting up.`);
        await engine.showText("She seems genuinely excited by the prospect.");
        await engine.showText(`"I would absolutely love that. Sunday mornings can be lonely sometimes."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 4);
        StatManager.addLust(state, 3);
        state.flags.sarah_sunday_tradition = true;
        
        await engine.showChoices([
          { text: 'Then you\'ll never be lonely on Sundays again', branch: 'early-never-lonely' },
          { text: 'Next week, I\'ll bring ingredients and cook for you', branch: 'early-cook-for-you' },
          { text: 'Maybe we could alternate between our places', branch: 'early-alternate-places' }
        ]);
      }
    },
    
    'breakfast-friend-level': {
      async execute(engine, state) {
        await engine.showText("The door opens before you can knock.");
        await engine.showText(`"I saw you coming up the walk with those pastries! You know me too well."`, "Sarah");
        await engine.showText("Sarah pulls you into a warm hug, her hair still slightly mussed from sleep.");
        await engine.showText(`"I've been looking forward to our Sunday morning all week."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 3);
        StatManager.addLust(state, 5);
        
        await engine.showChoices([
          { text: 'I love how comfortable we\'ve become together', branch: 'friend-comfortable-together' },
          { text: 'You look adorable with messy hair', branch: 'friend-adorable-messy-hair' },
          { text: 'Kiss her cheek good morning', branch: 'friend-kiss-cheek' }
        ]);
      }
    },
    
    'friend-kiss-cheek': {
      async execute(engine, state) {
        await engine.showText("You lean in and give Sarah a gentle good morning kiss on the cheek.");
        await engine.showText(`"Mmm, I could definitely get used to Sunday greetings like that,"` + ` she murmurs.`);
        await engine.showText("Her hand lingers on your arm as she looks into your eyes with obvious affection.");
        
        await engine.showText("She leads you to her cozy breakfast nook, which she's set with flowers and her best dishes.");
        
        StatManager.addLust(state, 6);
        RelationManager.addRelation(state.neighbor, 4);
        
        await engine.showChoices([
          { text: 'You went all out for breakfast today', branch: 'friend-went-all-out' },
          { text: 'Every moment with you feels like a celebration', branch: 'friend-feels-celebration' },
          { text: 'Take her hand across the table', branch: 'friend-take-hand-table' }
        ]);
      }
    },
    
    'friend-take-hand-table': {
      async execute(engine, state) {
        await engine.showText("You reach across the table and gently take Sarah's hand in yours.");
        await engine.showText("Her fingers intertwine with yours naturally, as if they belong there.");
        await engine.showText(`"This feels so right,"` + ` she says softly, her thumb tracing circles on your palm.`);
        
        await engine.showText("You eat breakfast together, hands connected, sharing intimate conversation and lingering glances.");
        
        StatManager.addLust(state, 8);
        RelationManager.addRelation(state.neighbor, 5);
        
        await engine.showChoices([
          { text: 'Sarah, I think I\'m falling for you', branch: 'friend-falling-for-you' },
          { text: 'I never want this moment to end', branch: 'friend-never-want-end' },
          { text: 'Bring her hand to your lips and kiss it', branch: 'friend-kiss-hand' }
        ]);
      }
    },
    
    'breakfast-intimate-level': {
      async execute(engine, state) {
        await engine.showText("Sarah opens the door wearing nothing but your shirt from yesterday and a radiant smile.");
        await engine.showText(`"Good morning, handsome. Perfect timing - I was just missing you."`, "Sarah");
        await engine.showText("She pulls you inside and kisses you passionately, pressing her body against yours.");
        
        await engine.showText(`"I made coffee, but I was hoping you'd provide breakfast,"` + ` she says with a sultry grin.`);
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 10);
        
        await engine.showChoices([
          { text: 'I brought pastries, but I\'d rather feast on you', branch: 'intimate-feast-on-you' },
          { text: 'Seeing you in my shirt drives me crazy', branch: 'intimate-drives-crazy' },
          { text: 'Kiss her neck while holding her close', branch: 'intimate-kiss-neck' }
        ]);
      }
    },
    
    'intimate-kiss-neck': {
      async execute(engine, state) {
        await engine.showText("You wrap your arms around Sarah and trail kisses along her neck.");
        await engine.showText(`"Oh god, yes,"` + ` she breathes, tilting her head to give you better access.`);
        await engine.showText("Her hands tangle in your hair as you find the sensitive spot below her ear.");
        
        await engine.showText(`"Breakfast can wait,"` + ` she whispers urgently.`);
        
        StatManager.addLust(state, 15);
        RelationManager.addRelation(state.neighbor, 3);
        
        await engine.showChoices([
          { text: 'Carry her to the bedroom', branch: 'intimate-carry-bedroom' },
          { text: 'Right here, right now', branch: 'intimate-right-here-now' },
          { text: 'I need you so much', branch: 'intimate-need-you-much' }
        ]);
      }
    },
    
    'intimate-carry-bedroom': {
      async execute(engine, state) {
        await engine.showText("You sweep Sarah into your arms and carry her toward the bedroom.");
        await engine.showText(`"My hero,"` + ` she laughs, kissing your neck as you carry her.`);
        await engine.showText("The pastries sit forgotten on the counter as you lose yourselves in passionate love-making...");
        
        await engine.showText("Hours later, you finally emerge for a very late breakfast, both glowing with satisfaction.");
        await engine.showText(`"Best Sunday morning ever,"` + ` Sarah sighs contentedly in your arms.`);
        
        StatManager.addLust(state, 20);
        StatManager.addEnergy(state, 10);
        state.flags.sarah_intimate_sunday = true;
      }
    }
  }
};

export default sundayBreakfast;