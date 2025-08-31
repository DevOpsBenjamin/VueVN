import type { VNEvent } from '@generate/types';
import { RelationManager, StatManager, MoneyManager } from '@generate/engine';

const talkBarista: VNEvent = {
  name: 'Talk to Maya - Router',
  foreground: 'assets/images/background/cafe/day.png',
  conditions: (state) => state.flags.talk_barista === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.talk_barista = false;
    
    // Check if barista is working
    const hour = state.gameTime.hour;
    
    if (hour < state.barista.workSchedule.startHour || 
        hour >= state.barista.workSchedule.endHour) {
      await engine.showText("The coffee shop is closed right now.");
      return;
    }
    
    await engine.showText(`You approach the counter where Maya is working.`);
    
    // Router logic based on relationship level
    const relationshipLevel = state.barista.relationship;
    const hasInteractedToday = RelationManager.hasInteractedToday(state, 'barista');
    
    if (relationshipLevel === 'stranger') {
      await engine.jump('talk-barista-stranger');
    } else if (relationshipLevel === 'acquaintance' && !hasInteractedToday) {
      await engine.jump('talk-barista-acquaintance');
    } else if (relationshipLevel === 'friend' && !hasInteractedToday) {
      await engine.jump('talk-barista-friend');
    } else if (relationshipLevel === 'close_friend') {
      await engine.jump('talk-barista-close-friend');
    } else {
      // Already interacted today
      await engine.jump('talk-barista-already-talked');
    }
  },
  
  branches: {
    'talk-barista-stranger': {
      async execute(engine, _) {
        await engine.showText(`"Hi there! Welcome to our coffee shop. What can I get you today?"`, "Maya");
        await engine.showText("Maya smiles politely but doesn't seem to recognize you.");
        
        await engine.showChoices([
          { text: 'Order coffee ($3)', branch: 'order-coffee' },
          { text: 'Just looking around', branch: 'just-browsing' },
          { text: 'Try to start a conversation', branch: 'start-conversation' }
        ]);
      }
    },
    
    'talk-barista-acquaintance': {
      async execute(engine, state) {
        await engine.showText(`"Oh hey! You're becoming a regular here. The usual?"`, "Maya");
        await engine.showText("Maya remembers you from previous visits.");
        
        RelationManager.interactDaily(state, 'barista', 2);
        
        await engine.showChoices([
          { text: 'Order coffee ($3)', branch: 'order-coffee' },
          { text: 'Chat about her work', branch: 'chat-work' },
          { text: 'Compliment her coffee skills', branch: 'compliment' }
        ]);
      }
    },
    
    'talk-barista-friend': {
      async execute(engine, state) {
        await engine.showText(`"Hey ${state.player.name}! Great to see you again. How's your day going?"`, "Maya");
        await engine.showText("Maya's face lights up when she sees you.");
        
        RelationManager.interactDaily(state, 'barista', 3);
        
        await engine.showChoices([
          { text: 'Ask about her day', branch: 'ask-about-day' },
          { text: 'Order coffee ($3)', branch: 'order-coffee' },
          { text: 'Flirt a little', branch: 'light-flirt' }
        ]);
      }
    },
    
    'talk-barista-close-friend': {
      async execute(engine, state) {
        const isHighLust = StatManager.isLustHigh(state);
        
        if (isHighLust) {
          await engine.showText(`"Hey gorgeous! You're looking particularly good today..."`, "Maya");
          await engine.showText("Maya bites her lip slightly as she looks at you.");
          
          await engine.showChoices([
            { text: 'Flirt back boldly', branch: 'bold-flirt' },
            { text: 'Suggest meeting after work', branch: 'suggest-meetup' },
            { text: 'Order coffee and play it cool', branch: 'order-coffee' }
          ]);
        } else {
          await engine.showText(`"${state.player.name}! My favorite customer. What can I make special for you today?"`, "Maya");
          
          RelationManager.interactDaily(state, 'barista', 1);
          
          await engine.showChoices([
            { text: 'Ask her to surprise you', branch: 'surprise-order' },
            { text: 'Chat about weekend plans', branch: 'weekend-plans' },
            { text: 'Flirt playfully', branch: 'playful-flirt' }
          ]);
        }
      }
    },
    
    'talk-barista-already-talked': {
      async execute(engine, _) {
        await engine.showText(`"Back again so soon? I like that!"`, "Maya");
        await engine.showText("You've already had a meaningful conversation with Maya today.");
        
        await engine.showChoices([
          { text: 'Order another coffee ($3)', branch: 'order-coffee' },
          { text: 'Just wanted to see you', branch: 'just-wanted-to-see' },
          { text: 'Leave', branch: 'leave-cafe' }
        ]);
      }
    },
    
    'start-conversation': {
      async execute(engine, state) {
        await engine.showText(`"I'm Maya, by the way. I don't think we've been properly introduced."`, "Maya");
        await engine.showText(`You tell her your name is ${state.player.name}.`);
        await engine.showText(`"Nice to meet you, ${state.player.name}!"`, "Maya");
        
        RelationManager.addRelation(state.barista, 5);
        StatManager.addLust(state, 2);
        
        await engine.showText("Maya seems friendly and approachable.");
        await engine.showChoices([
          { text: 'Order coffee now ($3)', branch: 'order-coffee' },
          { text: 'Ask how long she\'s worked here', branch: 'ask-work-history' }
        ]);
      }
    },
    
    'order-coffee': {
      async execute(engine, state) {
        if (MoneyManager.spendPocket(state, 3)) {
          StatManager.addEnergy(state, 15);
          await engine.showText(`"Here's your coffee! That'll be $3."`, "Maya");
          await engine.showText("The coffee is excellent and gives you energy.");
          await engine.showText(`Energy +15 | Money: $${state.player.pocketMoney}`);
        } else {
          await engine.showText(`"Oh, looks like you're a bit short. No worries, maybe next time!"`, "Maya");
          await engine.showText("You don't have enough money for coffee.");
        }
      }
    },
    
    'light-flirt': {
      async execute(engine, state) {
        await engine.showText(`"You always know how to make a girl smile."`, "Maya");
        await engine.showText("Maya blushes slightly and tucks her hair behind her ear.");
        
        RelationManager.addRelation(state.barista, 2);
        StatManager.addLust(state, 5);
        
        await engine.showText("Your charm is working on Maya.");
      }
    },
    
    'bold-flirt': {
      async execute(engine, state) {
        await engine.showText(`"You're quite the charmer, aren't you?"`, "Maya");
        await engine.showText("Maya leans closer across the counter.");
        await engine.showText(`"I get off work at 7... just saying."`, "Maya");
        
        StatManager.addLust(state, 10);
        state.flags.maya_invitation = true;
        
        await engine.showText("Maya is clearly interested in you.");
      }
    },
    
    'just-browsing': {
      async execute(engine, _) {
        await engine.showText(`"Take your time! Let me know if you need anything."`, "Maya");
        await engine.showText("Maya goes back to her work behind the counter.");
      }
    },
    
    'ask-work-history': {
      async execute(engine, state) {
        await engine.showText(`"I've been working here for about two years now. I love the coffee culture and meeting new people!"`, "Maya");
        await engine.showText("Maya's enthusiasm is infectious.");
        
        RelationManager.addRelation(state.barista, 2);
        
        await engine.showChoices([
          { text: 'Order coffee ($3)', branch: 'order-coffee' },
          { text: 'That sounds great!', branch: 'leave-cafe' }
        ]);
      }
    },
    
    'just-wanted-to-see': {
      async execute(engine, state) {
        await engine.showText(`"That's so sweet! You always know how to make my day better."`, "Maya");
        StatManager.addLust(state, 3);
        RelationManager.addRelation(state.barista, 1);
      }
    },
    
    'leave-cafe': {
      async execute(engine, _) {
        await engine.showText(`"Come back soon!"`, "Maya");
        await engine.showText("You wave goodbye and leave the coffee shop.");
      }
    }
  }
};

export default talkBarista;