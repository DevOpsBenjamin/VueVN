import type { VNEvent, ChoiceFull } from '@generate/types';
import { RelationManager, StatManager } from '@generate/engine';
import { RelationLevel } from '@generate/enums';
import text from '@generate/texts';

// Shortcut to text
const t = text.locations.cafe.talk_barista_router;

const BRANCH = {
  ALREADY_TALKED: "talk-already",
  LEAVE: "leave-cafe",
  JUST_SEE: "just-wanted-to-see"
} as const;

const talkBarista: VNEvent = {
  name: 'Talk to Maya',
  foreground: '/cafe/images/foreground/barista.png',
  conditions: (state) => state.flags.talk_barista === true,
  unlocked: () => true,
  locked: () => false,

  async execute(engine, state) {
    state.flags.talk_barista = false;

    // Check if barista is working
    const hour = state.gameTime.hour;

    if (hour < state.barista.workSchedule.startHour ||
      hour >= state.barista.workSchedule.endHour) {
      await engine.showText({ text: t.closed_now });
      return
    }

    await engine.showText({ text: t.approach_counter });

    // Router logic based on relationship level
    const relationshipLevel = state.barista.relationship;
    const interacted = state.barista.daily.interacted == true;

    if (interacted) {
      await engine.jump(BRANCH.ALREADY_TALKED);
      // return is kinda useless but make code cleaner
      return;
    }
    //Once a day small gain in relationship
    RelationManager.interactDaily(state.barista);
    // CONDITIONAL
    if (relationshipLevel === RelationLevel.STRANGER) {
      state.barista.daily.talk_stranger = true;
    } else if (relationshipLevel === RelationLevel.ACQUAINTANCE) {
      state.barista.daily.talk_acquaintance = true;
    } else if (relationshipLevel === RelationLevel.FRIEND) {
      state.barista.daily.talk_friend = true;
    } else if (relationshipLevel === RelationLevel.CLOSE_FRIEND) {
      state.barista.daily.talk_close = true;
    }
    // Event now exit and engine run will play sub_event from flags.
  },

  branches: {
    [BRANCH.ALREADY_TALKED]: {
      async execute(engine, state) {
        await engine.showText({ text: t.already_back_again, from: state.barista.name });
        await engine.showText({ text: t.already_talked_today });

        let choices: ChoiceFull[] = [];//[{ text: t.choice_order_another, branch: BRANCH.ORDER_COFFEE }];
        if (state.barista.relationship != RelationLevel.STRANGER) {
          choices.push({ text: t.choice_just_wanted, branch: BRANCH.JUST_SEE });
        }
        choices.push({ text: t.choice_leave, branch: BRANCH.LEAVE });
        await engine.showChoices(choices);
      }
    },

    [BRANCH.LEAVE]: {
      async execute(engine, state) {
        await engine.showText({ text: t.leave_come_back, from: state.barista.name });
        await engine.showText({ text: t.leave_wave });
      }
    },

    [BRANCH.JUST_SEE]: {
      async execute(engine, state) {
        await engine.showText({ text: t.just_wanted_sweet, from: state.barista.name });
        StatManager.addLust(state, 3);
        RelationManager.addRelation(state.barista, 3);
      }
    },

    /*
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
      */
  }
};

export default talkBarista;
