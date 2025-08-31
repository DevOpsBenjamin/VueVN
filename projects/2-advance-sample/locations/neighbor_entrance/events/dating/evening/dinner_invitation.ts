import type { VNEvent } from '@generate/types';
import { RelationManager, StatManager, MoneyManager } from '@generate/engine';

const dinnerInvitation: VNEvent = {
  name: 'Evening Dinner with Sarah',
  foreground: 'assets/images/background/neighbor/entrance.png',
  conditions: (state) => state.flags.sarah_dinner_invitation === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.sarah_dinner_invitation = false;
    
    const hour = state.gameTime.hour;
    const relationshipLevel = state.neighbor.relationship;
    const hasInteractedToday = RelationManager.hasInteractedToday(state, 'neighbor');
    
    // Action unlocked conditions already ensure proper dinner hours
    
    if (hasInteractedToday) {
      await engine.showText("You've already spent quality time with Sarah today, but she might still be up for dinner.");
    }
    
    await engine.showText("You approach Sarah's door as the evening light casts a warm glow over her porch.");
    await engine.showText("The scent of something delicious cooking wafts through her window.");
    
    if (relationshipLevel === 'stranger') {
      await engine.jump('dinner-stranger-level');
    } else if (relationshipLevel === 'acquaintance') {
      await engine.jump('dinner-acquaintance-level');
    } else if (relationshipLevel === 'friend') {
      await engine.jump('dinner-friend-level');
    } else if (relationshipLevel === 'close_friend') {
      await engine.jump('dinner-intimate-level');
    }
  },
  
  branches: {
    'dinner-stranger-level': {
      async execute(engine, state) {
        await engine.showText("*knock knock*");
        await engine.showText(`"Oh! Hello there. I wasn't expecting anyone."`, "Sarah");
        await engine.showText("Sarah opens the door, looking slightly surprised but not unwelcoming.");
        
        await engine.showChoices([
          { text: 'I hope I\'m not intruding. Something smells amazing', branch: 'stranger-compliment-cooking' },
          { text: 'I was wondering if you\'d like some company for dinner', branch: 'stranger-direct-invite' },
          { text: 'Sorry, I can come back another time', branch: 'stranger-offer-leave' }
        ]);
      }
    },
    
    'stranger-compliment-cooking': {
      async execute(engine, state) {
        await engine.showText(`"Oh, thank you! I'm making my grandmother's pasta recipe."`, "Sarah");
        await engine.showText("Sarah's eyes light up as she talks about her cooking.");
        await engine.showText(`"I always make too much for one person... would you like to join me?"`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 3);
        
        await engine.showChoices([
          { text: 'I would be honored', branch: 'stranger-accept-graciously' },
          { text: 'Are you sure? I don\'t want to impose', branch: 'stranger-polite-concern' },
          { text: 'That sounds wonderful', branch: 'stranger-accept-simple' }
        ]);
      }
    },
    
    'stranger-accept-graciously': {
      async execute(engine, state) {
        await engine.showText(`"Please, come in! It's nice to have someone to share a meal with."`, "Sarah");
        await engine.showText("Sarah leads you into her cozy dining room. The table is set for one, but she quickly adds another place setting.");
        await engine.showText(`"I hope you like Italian food. My grandmother was from Tuscany."`, "Sarah");
        
        await engine.showText("You spend the evening sharing delicious pasta and learning about Sarah's family history.");
        await engine.showText("Her stories about her grandmother are touching and personal.");
        
        RelationManager.addRelation(state.neighbor, 5);
        StatManager.addEnergy(state, 15); // Good meal
        StatManager.addLust(state, 3);
        
        await engine.showChoices([
          { text: 'Thank you for sharing these memories with me', branch: 'stranger-appreciate-sharing' },
          { text: 'Your grandmother would be proud of this meal', branch: 'stranger-compliment-cooking-skill' },
          { text: 'I\'d love to cook for you sometime', branch: 'stranger-offer-reciprocate' }
        ]);
      }
    },
    
    'dinner-acquaintance-level': {
      async execute(engine, state) {
        await engine.showText("*knock knock*");
        await engine.showText(`"${state.player.name}! Perfect timing - I just finished cooking."`, "Sarah");
        await engine.showText("Sarah opens the door with a warm smile, clearly pleased to see you.");
        await engine.showText(`"I was actually hoping you might stop by. I made way too much food again."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 2);
        
        await engine.showChoices([
          { text: 'You were hoping I\'d stop by?', branch: 'acquaintance-hopeful-question' },
          { text: 'I can\'t resist your cooking', branch: 'acquaintance-compliment-cooking' },
          { text: 'I brought some wine to share', branch: 'acquaintance-wine-offering' }
        ]);
      }
    },
    
    'acquaintance-hopeful-question': {
      async execute(engine, state) {
        await engine.showText(`"Well... yes. I really enjoy your company."`, "Sarah");
        await engine.showText("Sarah's cheeks turn slightly pink as she admits this.");
        await engine.showText(`"There's something about sharing a meal that makes everything feel more... intimate."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 3);
        StatManager.addLust(state, 4);
        
        await engine.showChoices([
          { text: 'I feel the same way about spending time with you', branch: 'acquaintance-mutual-feeling' },
          { text: 'Intimate is a beautiful word for it', branch: 'acquaintance-appreciate-intimacy' },
          { text: 'Then let\'s make tonight special', branch: 'acquaintance-make-special' }
        ]);
      }
    },
    
    'dinner-friend-level': {
      async execute(engine, state) {
        await engine.showText("Before you can even knock, the door swings open.");
        await engine.showText(`"I saw you coming up the walk! I was hoping you'd join me tonight."`, "Sarah");
        await engine.showText("Sarah pulls you into a warm hug before leading you inside.");
        await engine.showText(`"I made your favorite - that chicken dish you complimented last time."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 3);
        
        await engine.showChoices([
          { text: 'You remembered my favorite dish?', branch: 'friend-touched-remembering' },
          { text: 'You spoil me, Sarah', branch: 'friend-appreciate-spoiling' },
          { text: 'Kiss her cheek in gratitude', branch: 'friend-grateful-kiss' }
        ]);
      }
    },
    
    'friend-grateful-kiss': {
      async execute(engine, state) {
        await engine.showText("You lean in and give Sarah a gentle kiss on the cheek.");
        await engine.showText(`"Mmm, I could get used to greetings like that,"` + ` she says softly.`);
        await engine.showText("Her hand lingers on your arm as she looks into your eyes.");
        
        StatManager.addLust(state, 5);
        RelationManager.addRelation(state.neighbor, 3);
        
        await engine.showChoices([
          { text: 'There\'s more where that came from', branch: 'friend-promise-more' },
          { text: 'You deserve all the affection I can give', branch: 'friend-deserve-affection' },
          { text: 'Hold her close for a moment', branch: 'friend-embrace-moment' }
        ]);
      }
    },
    
    'dinner-intimate-level': {
      async execute(engine, state) {
        await engine.showText("Sarah opens the door wearing an elegant dress that takes your breath away.");
        await engine.showText(`"I was wondering when you'd arrive, handsome. I've been waiting for you."`, "Sarah");
        await engine.showText("She pulls you into a passionate kiss right there in the doorway.");
        
        await engine.showText("The dining room is set with candles, flowers, and her finest dishes.");
        await engine.showText(`"I wanted tonight to be perfect for us,"` + ` she whispers.`);
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 6);
        
        await engine.showChoices([
          { text: 'You look absolutely stunning tonight', branch: 'intimate-compliment-dress' },
          { text: 'Every night with you is perfect', branch: 'intimate-every-night-perfect' },
          { text: 'Kiss her passionately', branch: 'intimate-passionate-kiss' }
        ]);
      }
    },
    
    'intimate-passionate-kiss': {
      async execute(engine, state) {
        await engine.showText("You pull Sarah into your arms and kiss her deeply, pouring all your desire into the moment.");
        await engine.showText(`"God, I love the way you kiss me,"` + ` she breathes against your lips.`);
        await engine.showText("Her hands tangle in your hair as she presses herself closer to you.");
        
        await engine.showText(`"Dinner can wait a few more minutes,"` + ` she murmurs seductively.`);
        
        StatManager.addLust(state, 10);
        RelationManager.addRelation(state.neighbor, 3);
        
        await engine.showChoices([
          { text: 'I need you right now', branch: 'intimate-need-now' },
          { text: 'Let\'s savor the anticipation', branch: 'intimate-savor-anticipation' },
          { text: 'You drive me crazy with desire', branch: 'intimate-crazy-desire' }
        ]);
      }
    },
    
    'intimate-need-now': {
      async execute(engine, state) {
        await engine.showText(`"Then take me,"` + ` she whispers passionately.`);
        await engine.showText("Sarah leads you toward her bedroom, her eyes dark with desire.");
        await engine.showText("The candlelit dinner waits forgotten as you lose yourselves in each other's embrace...");
        
        StatManager.addLust(state, 15);
        state.flags.sarah_intimate_dinner = true;
        
        await engine.showText("Hours later, you finally make it back to the now-cold dinner.");
        await engine.showText(`"Worth the wait,"` + ` Sarah says with a satisfied smile.`);
      }
    }
  }
};

export default dinnerInvitation;