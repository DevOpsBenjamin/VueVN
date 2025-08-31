import type { VNEvent } from '@generate/types';
import { RelationManager, StatManager } from '@generate/engine';

const casualChat: VNEvent = {
  name: 'Morning Chat with Sarah',
  foreground: 'assets/images/background/neighbor/entrance.png',
  conditions: (state) => state.flags.neighbor_morning_chat === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.neighbor_morning_chat = false;
    
    const hour = state.gameTime.hour;
    const relationshipLevel = state.neighbor.relationship;
    const hasInteractedToday = RelationManager.hasInteractedToday(state, 'neighbor');
    
    // Action unlocked conditions already ensure proper morning hours
    
    if (hasInteractedToday) {
      await engine.jump('morning-already-talked');
      return;
    }
    
    await engine.showText("You see Sarah stepping out of her house, looking fresh and ready for the day.");
    
    if (relationshipLevel === 'stranger') {
      await engine.jump('morning-stranger-chat');
    } else if (relationshipLevel === 'acquaintance') {
      await engine.jump('morning-acquaintance-chat');
    } else if (relationshipLevel === 'friend') {
      await engine.jump('morning-friend-chat');
    } else if (relationshipLevel === 'close_friend') {
      await engine.jump('morning-close-friend-chat');
    }
  },
  
  branches: {
    'morning-stranger-chat': {
      async execute(engine, state) {
        await engine.showText(`"Oh, hello there! You're up early."`, "Sarah");
        await engine.showText("Sarah seems a bit surprised but not unwelcoming.");
        
        await engine.showChoices([
          { text: 'Good morning! Beautiful day, isn\'t it?', branch: 'stranger-weather-talk' },
          { text: 'I\'m always an early riser', branch: 'stranger-early-bird' },
          { text: 'Just heading out myself', branch: 'stranger-brief-chat' }
        ]);
      }
    },
    
    'stranger-weather-talk': {
      async execute(engine, state) {
        await engine.showText(`"It really is! I love starting my day with fresh morning air."`, "Sarah");
        await engine.showText(`"There's something peaceful about the morning, don't you think?"`, "Sarah");
        await engine.showText("Sarah's eyes sparkle as she talks about the morning. She seems like a nature lover.");
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 1);
        
        await engine.showChoices([
          { text: 'I completely agree. Maybe we could walk together sometime?', branch: 'stranger-suggest-walk' },
          { text: 'You have a great attitude about mornings', branch: 'stranger-compliment-attitude' },
          { text: 'Well, I should let you get on with your day', branch: 'stranger-polite-exit' }
        ]);
      }
    },
    
    'stranger-early-bird': {
      async execute(engine, state) {
        await engine.showText(`"That's admirable! I'm trying to become more of a morning person myself."`, "Sarah");
        await engine.showText(`"Any tips for making early mornings easier?"`, "Sarah");
        await engine.showText("Sarah genuinely seems interested in your morning routine.");
        
        RelationManager.addRelation(state.neighbor, 2);
        
        await engine.showChoices([
          { text: 'Good sleep schedule and morning coffee work wonders', branch: 'stranger-advice-coffee' },
          { text: 'Having something to look forward to helps', branch: 'stranger-advice-motivation' },
          { text: 'It\'s all about finding your rhythm', branch: 'stranger-advice-rhythm' }
        ]);
      }
    },
    
    'stranger-suggest-walk': {
      async execute(engine, state) {
        await engine.showText(`"That... actually sounds really nice! I usually walk alone."`, "Sarah");
        await engine.showText("Sarah's cheeks tint slightly pink as she considers your suggestion.");
        await engine.showText(`"Maybe this weekend? If you're serious about it."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 3);
        StatManager.addLust(state, 2);
        state.flags.sarah_walk_planned = true;
        
        await engine.showText("You've made plans for a morning walk with Sarah this weekend!");
      }
    },
    
    'morning-acquaintance-chat': {
      async execute(engine, state) {
        await engine.showText(`"Good morning, ${state.player.name}! You're becoming quite the early bird."`, "Sarah");
        await engine.showText("Sarah gives you a warm smile, clearly pleased to see you.");
        
        RelationManager.addRelation(state.neighbor, 2);
        
        await engine.showChoices([
          { text: 'Good morning, Sarah! You look lovely today', branch: 'acquaintance-compliment' },
          { text: 'I enjoy our morning encounters', branch: 'acquaintance-enjoy-meetings' },
          { text: 'How has your week been?', branch: 'acquaintance-week-check' }
        ]);
      }
    },
    
    'acquaintance-compliment': {
      async execute(engine, state) {
        await engine.showText(`"Thank you! That's sweet of you to say."`, "Sarah");
        await engine.showText("Sarah's face lights up with a genuine smile.");
        await engine.showText(`"I actually put a little extra effort in this morning. It's nice that someone noticed."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 3);
        
        await engine.showChoices([
          { text: 'You always look beautiful to me', branch: 'acquaintance-deeper-compliment' },
          { text: 'Well, your efforts definitely paid off', branch: 'acquaintance-acknowledge-effort' },
          { text: 'I\'m quite observant when it comes to you', branch: 'acquaintance-flirty-observation' }
        ]);
      }
    },
    
    'morning-friend-chat': {
      async execute(engine, state) {
        await engine.showText(`"${state.player.name}! Perfect timing - I was just thinking about you."`, "Sarah");
        await engine.showText("Sarah's face brightens considerably when she sees you.");
        await engine.showText(`"I made extra coffee this morning. Would you like to share some before we start our days?"`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 2);
        
        await engine.showChoices([
          { text: 'I\'d love to share coffee with you', branch: 'friend-accept-coffee' },
          { text: 'You were thinking about me?', branch: 'friend-thinking-about-me' },
          { text: 'That sounds perfect, just like you', branch: 'friend-flirty-perfect' }
        ]);
      }
    },
    
    'friend-accept-coffee': {
      async execute(engine, state) {
        await engine.showText(`"Wonderful! Come in, come in."`, "Sarah");
        await engine.showText("Sarah leads you into her cozy kitchen. The morning light streams through her windows beautifully.");
        await engine.showText(`"I hope you don't mind - I made it a bit strong today. I needed the extra energy."`, "Sarah");
        
        StatManager.addEnergy(state, 10);
        RelationManager.addRelation(state.neighbor, 3);
        
        await engine.showChoices([
          { text: 'This coffee is perfect, just like this moment', branch: 'friend-romantic-coffee' },
          { text: 'Rough night? You can tell me about it', branch: 'friend-caring-inquiry' },
          { text: 'Your kitchen feels so warm and welcoming', branch: 'friend-compliment-home' }
        ]);
      }
    },
    
    'morning-close-friend-chat': {
      async execute(engine, state) {
        const isHighLust = StatManager.isLustHigh(state);
        
        if (isHighLust) {
          await engine.showText(`"Good morning, handsome. You're looking particularly good today."`, "Sarah");
          await engine.showText("Sarah gives you a lingering look that makes your heart race.");
          await engine.showText(`"I was just about to shower... care to keep me company?"`, "Sarah");
          
          await engine.showChoices([
            { text: 'I would love nothing more', branch: 'close-friend-intimate-morning' },
            { text: 'You\'re incredibly tempting', branch: 'close-friend-tempting-response' },
            { text: 'Maybe after we talk a bit more', branch: 'close-friend-build-anticipation' }
          ]);
        } else {
          await engine.showText(`"Good morning, sweetheart! I was hoping I'd see you today."`, "Sarah");
          await engine.showText("Sarah approaches you with obvious affection, her eyes sparkling with warmth.");
          
          RelationManager.addRelation(state.neighbor, 1);
          StatManager.addLust(state, 3);
          
          await engine.showChoices([
            { text: 'Kiss her good morning', branch: 'close-friend-morning-kiss' },
            { text: 'You make every morning better', branch: 'close-friend-sweet-words' },
            { text: 'I missed you', branch: 'close-friend-missed-you' }
          ]);
        }
      }
    },
    
    'close-friend-morning-kiss': {
      async execute(engine, state) {
        await engine.showText("You pull Sarah close and give her a tender morning kiss.");
        await engine.showText(`"Mmm, now that's the perfect way to start a day,"` + ` Sarah purrs against your lips.`);
        await engine.showText("Her arms wrap around your neck as she deepens the kiss slightly.");
        
        StatManager.addLust(state, 5);
        RelationManager.addRelation(state.neighbor, 2);
        
        await engine.showChoices([
          { text: 'How about we continue this inside?', branch: 'close-friend-suggest-inside' },
          { text: 'You taste even better than I remembered', branch: 'close-friend-compliment-kiss' },
          { text: 'Every kiss with you feels like the first', branch: 'close-friend-romantic-words' }
        ]);
      }
    },
    
    'morning-already-talked': {
      async execute(engine, _) {
        await engine.showText("You've already had a meaningful conversation with Sarah this morning.");
        await engine.showText("She waves at you warmly but seems busy with her morning routine.");
      }
    }
  }
};

export default casualChat;