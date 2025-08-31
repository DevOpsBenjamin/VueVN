import type { VNEvent } from '@generate/types';
import { RelationManager, StatManager, MoneyManager } from '@generate/engine';

const deepConversation: VNEvent = {
  name: 'Deep Conversation with Maya',
  foreground: 'assets/images/background/cafe/day.png',
  conditions: (state) => state.flags.maya_deep_conversation === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.maya_deep_conversation = false;
    
    const hour = state.gameTime.hour;
    const relationshipLevel = state.barista.relationship;
    const hasInteractedToday = RelationManager.hasInteractedToday(state, 'barista');
    
    // Action unlocked conditions already ensure proper work hours and timing
    
    if (hasInteractedToday && relationshipLevel !== 'close_friend') {
      await engine.showText("You've already had a good conversation with Maya today during her work hours.");
      return;
    }
    
    await engine.showText("You approach the counter during a quiet moment. Maya looks up with a genuine smile.");
    
    if (relationshipLevel === 'stranger') {
      await engine.jump('deep-stranger-level');
    } else if (relationshipLevel === 'acquaintance') {
      await engine.jump('deep-acquaintance-level');
    } else if (relationshipLevel === 'friend') {
      await engine.jump('deep-friend-level');
    } else if (relationshipLevel === 'close_friend') {
      await engine.jump('deep-intimate-level');
    }
  },
  
  branches: {
    'deep-stranger-level': {
      async execute(engine, state) {
        await engine.showText(`"Hi there! You look like you might want to talk about something more than just coffee."`, "Maya");
        await engine.showText("Maya leans against the counter, giving you her full attention despite being at work.");
        await engine.showText(`"I'm Maya, by the way. I don't think we've really been properly introduced."`, "Maya");
        
        await engine.showChoices([
          { text: 'I\'m attracted to more than just your coffee', branch: 'stranger-attracted-comment' },
          { text: 'You have an amazing intuition about people', branch: 'stranger-intuition-compliment' },
          { text: 'I\'d love to get to know the real you', branch: 'stranger-know-real-you' }
        ]);
      }
    },
    
    'stranger-attracted-comment': {
      async execute(engine, state) {
        await engine.showText(`"Oh my! That's quite forward,"` + ` Maya says with a playful laugh.`);
        await engine.showText("Her cheeks turn slightly pink, but she doesn't seem offended.");
        await engine.showText(`"I like honesty in a person. Most people just small-talk about the weather."`, "Maya");
        
        RelationManager.addRelation(state.barista, 3);
        StatManager.addLust(state, 4);
        
        await engine.showChoices([
          { text: 'Life\'s too short for small talk with someone like you', branch: 'stranger-life-too-short' },
          { text: 'I find you incredibly intriguing', branch: 'stranger-find-intriguing' },
          { text: 'Would you like to continue this conversation after work?', branch: 'stranger-after-work-suggestion' }
        ]);
      }
    },
    
    'stranger-know-real-you': {
      async execute(engine, state) {
        await engine.showText(`"The real me? That's... refreshing. Most people just see 'the barista.'"`, "Maya");
        await engine.showText("Maya's expression becomes more thoughtful and open.");
        await engine.showText(`"Well, the real me loves art, dreams of traveling, and reads poetry during slow afternoons."`, "Maya");
        
        RelationManager.addRelation(state.barista, 4);
        StatManager.addLust(state, 2);
        
        await engine.showChoices([
          { text: 'Poetry? I\'d love to hear about your favorite poets', branch: 'stranger-poetry-interest' },
          { text: 'Where would you travel if you could go anywhere?', branch: 'stranger-travel-dreams' },
          { text: 'You\'re much more fascinating than I imagined', branch: 'stranger-more-fascinating' }
        ]);
      }
    },
    
    'deep-acquaintance-level': {
      async execute(engine, state) {
        await engine.showText(`"${state.player.name}! You're becoming one of my favorite regulars."`, "Maya");
        await engine.showText("Maya's eyes light up when she sees you, and she immediately starts preparing your usual order.");
        await engine.showText(`"You know, I've been thinking about our last conversation. You asked some really thoughtful questions."`, "Maya");
        
        RelationManager.addRelation(state.barista, 2);
        
        await engine.showChoices([
          { text: 'I love learning more about you', branch: 'acquaintance-love-learning' },
          { text: 'You inspire me to think deeper', branch: 'acquaintance-inspire-thinking' },
          { text: 'I find myself thinking about you often', branch: 'acquaintance-think-about-you' }
        ]);
      }
    },
    
    'acquaintance-think-about-you': {
      async execute(engine, state) {
        await engine.showText(`"You... think about me?"` + ` Maya asks softly, her cheeks flushing.`);
        await engine.showText("She pauses in her coffee preparation, clearly affected by your words.");
        await engine.showText(`"That's... really sweet. I think about you too, actually."`, "Maya");
        
        RelationManager.addRelation(state.barista, 4);
        StatManager.addLust(state, 5);
        
        await engine.showChoices([
          { text: 'What do you think about when you think of me?', branch: 'acquaintance-what-think-about' },
          { text: 'I hope they\'re good thoughts', branch: 'acquaintance-hope-good-thoughts' },
          { text: 'Maybe we should explore these thoughts together', branch: 'acquaintance-explore-together' }
        ]);
      }
    },
    
    'deep-friend-level': {
      async execute(engine, state) {
        await engine.showText(`"Perfect timing! I was just thinking about taking my break."`, "Maya");
        await engine.showText("Maya comes around the counter and sits at a small table with you.");
        await engine.showText(`"I've been wanting to tell you something, ${state.player.name}. You've become really important to me."`, "Maya");
        
        RelationManager.addRelation(state.barista, 3);
        StatManager.addLust(state, 4);
        
        await engine.showChoices([
          { text: 'You\'re important to me too, Maya', branch: 'friend-mutual-importance' },
          { text: 'Tell me what\'s on your mind', branch: 'friend-whats-on-mind' },
          { text: 'Take her hand gently', branch: 'friend-take-hand' }
        ]);
      }
    },
    
    'friend-take-hand': {
      async execute(engine, state) {
        await engine.showText("You reach across the table and gently take Maya's hand.");
        await engine.showText(`"Your hands are so warm,"` + ` she says softly, not pulling away.`);
        await engine.showText("Her thumb traces small circles on your palm as she looks into your eyes.");
        
        await engine.showText(`"I've never felt this comfortable with a customer before. You're... different."`, "Maya");
        
        StatManager.addLust(state, 6);
        RelationManager.addRelation(state.barista, 4);
        
        await engine.showChoices([
          { text: 'You make me feel different too', branch: 'friend-feel-different' },
          { text: 'I don\'t want to be just a customer to you', branch: 'friend-not-just-customer' },
          { text: 'Intertwine your fingers with hers', branch: 'friend-intertwine-fingers' }
        ]);
      }
    },
    
    'deep-intimate-level': {
      async execute(engine, state) {
        await engine.showText(`"There's my favorite person,"` + ` Maya says with a radiant smile.`);
        await engine.showText("She immediately comes around the counter to greet you with a warm hug.");
        await engine.showText(`"I've been counting the minutes until you'd show up. Is that pathetic?"`, "Maya");
        
        await engine.showText("Her arms linger around you longer than would be appropriate for a typical customer.");
        
        RelationManager.addRelation(state.barista, 2);
        StatManager.addLust(state, 5);
        
        await engine.showChoices([
          { text: 'It\'s adorable, and I feel the same way', branch: 'intimate-feel-same' },
          { text: 'I\'ve been thinking about you all day', branch: 'intimate-thinking-all-day' },
          { text: 'Kiss her forehead tenderly', branch: 'intimate-forehead-kiss' }
        ]);
      }
    },
    
    'intimate-forehead-kiss': {
      async execute(engine, state) {
        await engine.showText("You lean in and place a tender kiss on Maya's forehead.");
        await engine.showText(`"Mmm, I love how you do that,"` + ` she purrs softly.`);
        await engine.showText("She closes her eyes and leans into your touch, completely comfortable with the intimacy.");
        
        await engine.showText(`"You know, my shift ends in an hour. Want to wait for me?"`, "Maya");
        
        StatManager.addLust(state, 8);
        RelationManager.addRelation(state.barista, 3);
        
        await engine.showChoices([
          { text: 'I\'ll wait as long as it takes', branch: 'intimate-wait-as-long' },
          { text: 'I have some ideas for when you\'re free', branch: 'intimate-have-ideas' },
          { text: 'Every moment with you is worth waiting for', branch: 'intimate-worth-waiting' }
        ]);
      }
    },
    
    'intimate-have-ideas': {
      async execute(engine, state) {
        await engine.showText(`"Oh? I like the sound of that,"` + ` Maya says with a mischievous glint in her eyes.`);
        await engine.showText("She leans closer and whispers so only you can hear.");
        await engine.showText(`"I have some ideas too. We should compare notes later."`, "Maya");
        
        StatManager.addLust(state, 10);
        state.flags.maya_after_work_plans = true;
        
        await engine.showText("The anticipation builds as you both exchange knowing looks across the coffee shop.");
      }
    }
  }
};

export default deepConversation;