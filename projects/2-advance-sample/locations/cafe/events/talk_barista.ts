import type { VNEvent } from '@generate/types';
import { RelationManager, StatManager, MoneyManager } from '@generate/engine';
import t from '@generate/texts';

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
      await engine.showText((t as any).locations.cafe.talk_barista.closed_now);
      return;
    }
    
    await engine.showText((t as any).locations.cafe.talk_barista.approach_counter);
    
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
        const text = (t as any).locations.cafe.talk_barista;
        await engine.showText(text.stranger_hi, "Maya");
        await engine.showText(text.stranger_smiles);
        
        await engine.showChoices([
          { text: text.choice_order, branch: 'order-coffee' },
          { text: text.choice_browse, branch: 'just-browsing' },
          { text: text.choice_start_conversation, branch: 'start-conversation' }
        ]);
      }
    },
    
    'talk-barista-acquaintance': {
      async execute(engine, state) {
        const text = (t as any).locations.cafe.talk_barista;
        await engine.showText(text.acquaintance_hey_regular, "Maya");
        await engine.showText(text.acquaintance_remembers);
        
        RelationManager.interactDaily(state, 'barista', 2);
        
        await engine.showChoices([
          { text: text.choice_order, branch: 'order-coffee' },
          { text: text.choice_chat_work, branch: 'chat-work' },
          { text: text.choice_compliment, branch: 'compliment' }
        ]);
      }
    },
    
    'talk-barista-friend': {
      async execute(engine, state) {
        const text = (t as any).locations.cafe.talk_barista;
        await engine.showText(text.friend_greeting.replace('%PLAYER_NAME%', state.player.name), "Maya");
        await engine.showText(text.friend_lights_up);
        
        RelationManager.interactDaily(state, 'barista', 3);
        
        await engine.showChoices([
          { text: text.choice_ask_day, branch: 'ask-about-day' },
          { text: text.choice_order, branch: 'order-coffee' },
          { text: text.choice_flirt_light, branch: 'light-flirt' }
        ]);
      }
    },
    
    'talk-barista-close-friend': {
      async execute(engine, state) {
        const isHighLust = StatManager.isLustHigh(state);
        
        if (isHighLust) {
          const text = (t as any).locations.cafe.talk_barista;
          await engine.showText(text.close_highlust_hey_gorgeous, "Maya");
          await engine.showText(text.close_bites_lip);
          
          await engine.showChoices([
            { text: text.choice_flirt_bold, branch: 'bold-flirt' },
            { text: text.choice_suggest_meetup, branch: 'suggest-meetup' },
            { text: text.choice_order_play_cool, branch: 'order-coffee' }
          ]);
        } else {
          const text = (t as any).locations.cafe.talk_barista;
          await engine.showText(text.close_normal_favorite_customer.replace('%PLAYER_NAME%', state.player.name), "Maya");
          
          RelationManager.interactDaily(state, 'barista', 1);
          
          await engine.showChoices([
            { text: text.choice_surprise_order, branch: 'surprise-order' },
            { text: text.choice_weekend_plans, branch: 'weekend-plans' },
            { text: text.choice_flirt_playful, branch: 'playful-flirt' }
          ]);
        }
      }
    },
    
    'talk-barista-already-talked': {
      async execute(engine, _) {
        const text = (t as any).locations.cafe.talk_barista;
        await engine.showText(text.already_back_again, "Maya");
        await engine.showText(text.already_talked_today);
        
        await engine.showChoices([
          { text: text.choice_order_another, branch: 'order-coffee' },
          { text: text.choice_just_wanted, branch: 'just-wanted-to-see' },
          { text: text.choice_leave, branch: 'leave-cafe' }
        ]);
      }
    },
    
    'start-conversation': {
      async execute(engine, state) {
        const text = (t as any).locations.cafe.talk_barista;
        await engine.showText(text.start_intro_maya, "Maya");
        await engine.showText(text.start_tell_name.replace('%PLAYER_NAME%', state.player.name));
        await engine.showText(text.start_nice_meet.replace('%PLAYER_NAME%', state.player.name), "Maya");
        
        RelationManager.addRelation(state.barista, 5);
        StatManager.addLust(state, 2);
        
        await engine.showText(text.start_seems_friendly);
        await engine.showChoices([
          { text: text.choice_order_now, branch: 'order-coffee' },
          { text: text.choice_ask_history, branch: 'ask-work-history' }
        ]);
      }
    },
    
    'order-coffee': {
      async execute(engine, state) {
        if (MoneyManager.spendPocket(state, 3)) {
          StatManager.addEnergy(state, 15);
          const text = (t as any).locations.cafe.talk_barista;
          await engine.showText(text.order_here_your_coffee, "Maya");
          await engine.showText(text.order_excellent_energy);
          await engine.showText(text.order_energy_money.replace('%MONEY%', String(state.player.pocketMoney)));
        } else {
          const text = (t as any).locations.cafe.talk_barista;
          await engine.showText(text.order_short_money_maya, "Maya");
          await engine.showText(text.order_not_enough_money);
        }
      }
    },
    
    'light-flirt': {
      async execute(engine, state) {
        const text = (t as any).locations.cafe.talk_barista;
        await engine.showText(text.flirt_light_line, "Maya");
        await engine.showText(text.flirt_light_blush);
        
        RelationManager.addRelation(state.barista, 2);
        StatManager.addLust(state, 5);
        
        await engine.showText(text.flirt_working);
      }
    },
    
    'bold-flirt': {
      async execute(engine, state) {
        const text = (t as any).locations.cafe.talk_barista;
        await engine.showText(text.bold_flirt_line1, "Maya");
        await engine.showText(text.bold_flirt_line2);
        await engine.showText(text.bold_flirt_offwork, "Maya");
        
        StatManager.addLust(state, 10);
        state.flags.maya_invitation = true;
        
        await engine.showText(text.bold_flirt_interest);
      }
    },
    
    'just-browsing': {
      async execute(engine, _) {
        const text = (t as any).locations.cafe.talk_barista;
        await engine.showText(text.just_browsing_take_time, "Maya");
        await engine.showText(text.just_browsing_back_to_work);
      }
    },
    
    'ask-work-history': {
      async execute(engine, state) {
        const text = (t as any).locations.cafe.talk_barista;
        await engine.showText(text.ask_work_history_answer, "Maya");
        await engine.showText(text.ask_work_history_enthusiasm);
        
        RelationManager.addRelation(state.barista, 2);
        
        await engine.showChoices([
          { text: text.choice_order, branch: 'order-coffee' },
          { text: text.choice_that_sounds_great, branch: 'leave-cafe' }
        ]);
      }
    },
    
    'just-wanted-to-see': {
      async execute(engine, state) {
        const text = (t as any).locations.cafe.talk_barista;
        await engine.showText(text.just_wanted_sweet, "Maya");
        StatManager.addLust(state, 3);
        RelationManager.addRelation(state.barista, 1);
      }
    },
    
    'leave-cafe': {
      async execute(engine, _) {
        const text = (t as any).locations.cafe.talk_barista;
        await engine.showText(text.leave_come_back, "Maya");
        await engine.showText(text.leave_wave);
      }
    }
  }
};

export default talkBarista;
