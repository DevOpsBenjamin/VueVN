import type { VNEvent } from '@generate/types';
import { RelationManager, StatManager } from '@generate/engine';
import t from '@generate/texts';

const rainyDay: VNEvent = {
  name: 'Rainy Day with Sarah',
  foreground: 'assets/images/background/neighbor/entrance_rain.png',
  conditions: (state) => state.flags.sarah_rainy_day === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.sarah_rainy_day = false;
    
    const relationshipLevel = state.neighbor.relationship;
    
    const text = (t as any).locations.neighbor_entrance.dating.special.rainy_day;
    await engine.showText(text.heavy_rain_begins);
    await engine.showText(text.warm_light_glowing);
    
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
        const text = (t as any).locations.neighbor_entrance.dating.special.rainy_day;
        await engine.showText(text.early_hesitate);
        await engine.showText(text.early_before_knock);
        await engine.showText(text.early_drenched, "Sarah");
        
        await engine.showText(text.early_pulls_inside);
        
        RelationManager.addRelation(state.neighbor, 3);
        
        await engine.showChoices([
          { text: text.choice_apologetic, branch: 'early-apologetic' },
          { text: text.choice_grateful, branch: 'early-grateful' },
          { text: text.choice_early_romantic, branch: 'early-romantic-confession' }
        ]);
      }
    },
    
    'early-grateful': {
      async execute(engine, state) {
        const text = (t as any).locations.neighbor_entrance.dating.special.rainy_day;
        await engine.showText(text.early_nonsense, "Sarah");
        await engine.showText(text.early_returns_towel);
        await engine.showText(text.early_warm_you_right_up, "Sarah");
        
        await engine.showText(text.early_fireplace_talk);
        await engine.showText(text.early_forced_intimacy);
        
        RelationManager.addRelation(state.neighbor, 5);
        StatManager.addEnergy(state, 15);
        StatManager.addLust(state, 4);
        
        await engine.showChoices([
          { text: text.choice_perfect_afternoon, branch: 'early-perfect-afternoon' },
          { text: text.choice_cozy_home, branch: 'early-cozy-home' },
          { text: text.choice_storm_wonderful, branch: 'early-storm-wonderful' }
        ]);
      }
    },
    
    'rainy-friend-level': {
      async execute(engine, state) {
        const text = (t as any).locations.neighbor_entrance.dating.special.rainy_day;
        await engine.showText(text.friend_watch_concern);
        await engine.showText(text.friend_wrap_towel);
        await engine.showText(text.friend_worried, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 3);
        StatManager.addLust(state, 5);
        
        await engine.showChoices([
          { text: text.friend_watching_for_me, branch: 'friend-watching-for-me' },
          { text: text.friend_love_care, branch: 'friend-love-care' },
          { text: text.friend_hold_close, branch: 'friend-hold-close-warmth' }
        ]);
      }
    },
    
    'friend-hold-close-warmth': {
      async execute(engine, state) {
        const text = (t as any).locations.neighbor_entrance.dating.special.rainy_day;
        await engine.showText(text.friend_pull_embrace);
        await engine.showText(text.friend_mmm_warm);
        await engine.showText(text.friend_get_you_warmed);
        
        await engine.showText(text.friend_leads_couch);
        await engine.showText(text.friend_sharing_warmth);
        
        StatManager.addLust(state, 8);
        RelationManager.addRelation(state.neighbor, 4);
        
        await engine.showChoices([
          { text: text.friend_gentle_kiss, branch: 'friend-gentle-kiss' },
          { text: text.friend_feels_right, branch: 'friend-feels-right' },
          { text: text.friend_wish_storm, branch: 'friend-wish-storm-lasted' }
        ]);
      }
    },
    
    'friend-gentle-kiss': {
      async execute(engine, state) {
        const text = (t as any).locations.neighbor_entrance.dating.special.rainy_day;
        await engine.showText(text.friend_kiss_softly);
        await engine.showText(text.friend_responds_warmly);
        await engine.showText(text.friend_hoping_do_that);
        
        await engine.showText(text.friend_kiss_deepens);
        
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
        const text = (t as any).locations.neighbor_entrance.dating.special.rainy_day;
        await engine.showText(text.intimate_at_door_robe_towel);
        await engine.showText(text.intimate_knew_you_come);
        await engine.showText(text.intimate_helps_undress);
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 8);
        
        await engine.showChoices([
          { text: text.intimate_know_me_well, branch: 'intimate-know-me-well' },
          { text: text.intimate_come_home, branch: 'intimate-come-home' },
          { text: text.intimate_let_undress, branch: 'intimate-let-undress' }
        ]);
      }
    },
    
    'intimate-let-undress': {
      async execute(engine, state) {
        const text = (t as any).locations.neighbor_entrance.dating.special.rainy_day;
        await engine.showText(text.intimate_hands_gentle);
        await engine.showText(text.intimate_need_warmed);
        await engine.showText(text.intimate_touch_lingers);
        
        await engine.showText(text.intimate_wraps_robe);
        
        StatManager.addLust(state, 15);
        
        await engine.showChoices([
          { text: text.intimate_need_warming, branch: 'intimate-need-warming' },
          { text: text.intimate_fire_between, branch: 'intimate-fire-between' },
          { text: text.intimate_shower_together, branch: 'intimate-shower-together' }
        ]);
      }
    },
    
    'intimate-shower-together': {
      async execute(engine, state) {
        const text = (t as any).locations.neighbor_entrance.dating.special.rainy_day;
        await engine.showText(text.intimate_best_idea);
        await engine.showText(text.intimate_leads_bathroom);
        await engine.showText(text.intimate_under_hot_water);
        
        await engine.showText(text.intimate_hours_later);
        await engine.showText(text.intimate_every_storm_should_end);
        
        StatManager.addLust(state, 20);
        StatManager.addEnergy(state, 25);
        state.flags.sarah_rainy_intimate = true;
      }
    }
  }
};

export default rainyDay;
