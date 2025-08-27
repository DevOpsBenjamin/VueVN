import type { VNEvent } from '@generate/types';
import { RelationManager, StatManager } from '@generate/engine';
import { RelationLevel } from '@generate/enums';

// Define branch names as const for type safety
const BRANCHES = {
  // Main relationship level branches
  STRANGER: 'walk-stranger-level',
  ACQUAINTANCE: 'walk-acquaintance-level',
  FRIEND: 'walk-friend-level',
  CLOSE_FRIEND: 'walk-close-friend-level',
  
  // Stranger level sub-branches
  STRANGER_GET_TO_KNOW: 'stranger-get-to-know',
  STRANGER_SHOULDNT_BE_ALONE: 'stranger-shouldnt-be-alone',
  STRANGER_OFFER_ARM: 'stranger-offer-arm',
  STRANGER_BEAUTIFUL_WOMAN: 'stranger-beautiful-woman',
  STRANGER_SHOW_ART: 'stranger-show-art',
  STRANGER_DESERVE_SOMEONE: 'stranger-deserve-someone',
  STRANGER_TAKE_BREATH_AWAY: 'stranger-take-breath-away',
  STRANGER_TAKE_HAND: 'stranger-take-hand',
  STRANGER_SHOW_HOW_MUCH: 'stranger-show-how-much',
  
  // Acquaintance level sub-branches
  ACQUAINTANCE_THINKING_ABOUT_YOU: 'acquaintance-thinking-about-you',
  ACQUAINTANCE_BEAUTIFUL_AFTER_WORK: 'acquaintance-beautiful-after-work',
  ACQUAINTANCE_ARM_AROUND_SHOULDERS: 'acquaintance-arm-around-shoulders',
  ACQUAINTANCE_THROUGH_YOUR_EYES: 'acquaintance-through-your-eyes',
  ACQUAINTANCE_LOOK_AT_STARS: 'acquaintance-look-at-stars',
  ACQUAINTANCE_FEELS_RIGHT: 'acquaintance-feels-right',
  ACQUAINTANCE_MORE_BEAUTIFUL_THAN_STARS: 'acquaintance-more-beautiful-than-stars',
  ACQUAINTANCE_HOLD_CLOSE: 'acquaintance-hold-close',
  
  // Friend level sub-branches
  FRIEND_THINKING_ABOUT_YOU: 'friend-thinking-about-you',
  FRIEND_BEAUTIFUL_AFTER_WORK: 'friend-beautiful-after-work',
  FRIEND_ARM_AROUND_SHOULDERS: 'friend-arm-around-shoulders',
  FRIEND_THROUGH_YOUR_EYES: 'friend-through-your-eyes',
  FRIEND_LOOK_AT_STARS: 'friend-look-at-stars',
  FRIEND_FEELS_RIGHT: 'friend-feels-right',
  FRIEND_KISS_UNDER_STARS: 'friend-kiss-under-stars',
  FRIEND_MORE_BEAUTIFUL_THAN_STARS: 'friend-more-beautiful-than-stars',
  FRIEND_HOLD_CLOSE: 'friend-hold-close',
  FRIEND_DREAMING_OF_MOMENT: 'friend-dreaming-of-moment',
  FRIEND_TASTE_BETTER: 'friend-taste-better',
  FRIEND_FALLING_FOR_YOU: 'friend-falling-for-you',
  
  // Close friend level sub-branches
  CLOSE_FRIEND_COULDNT_CONCENTRATE: 'close-friend-couldnt-concentrate',
  CLOSE_FRIEND_ETERNITY_APART: 'close-friend-eternity-apart',
  CLOSE_FRIEND_SOMETHING_SPECIAL: 'close-friend-something-special',
  CLOSE_FRIEND_MOST_IMPORTANT: 'close-friend-most-important',
  CLOSE_FRIEND_PRIVATE_DINNER: 'close-friend-private-dinner',
  CLOSE_FRIEND_YOUR_PLACE: 'close-friend-your-place'
} as const;

const romanticWalk: VNEvent = {
  name: 'After Work Romantic Walk with Maya',
  foreground: 'assets/images/background/city/evening.png',
  conditions: (state) => state.flags.maya_romantic_walk === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.maya_romantic_walk = false;
    
    const relationshipLevel = state.barista.relationship;    
    // Action unlocked conditions already ensure proper timing
    
    await engine.showText("You wait outside the coffee shop as Maya finishes her shift.");
    await engine.showText("She emerges looking slightly tired but her face lights up when she sees you.");
    
    if (relationshipLevel === RelationLevel.STRANGER) {
      await engine.jump(BRANCHES.STRANGER);
    } else if (relationshipLevel === RelationLevel.ACQUAINTANCE) {
      await engine.jump(BRANCHES.ACQUAINTANCE);
    } else if (relationshipLevel === RelationLevel.FRIEND) {
      await engine.jump(BRANCHES.FRIEND);
    } else if (relationshipLevel === RelationLevel.CLOSE_FRIEND) {
      await engine.jump(BRANCHES.CLOSE_FRIEND);
    }
  },
  
  branches: {
    [BRANCHES.STRANGER]: {
      async execute(engine, state) {
        await engine.showText(`"Oh wow, you actually waited for me! That's... really sweet."`, "Maya");
        await engine.showText("Maya seems genuinely touched that you waited for her.");
        await engine.showText(`"I was just going to head home, but a walk sounds much better than sitting alone."`, "Maya");
        
        await engine.showChoices([
          { text: 'I wanted to spend more time getting to know you', branch: BRANCHES.STRANGER_GET_TO_KNOW }
        ]);
      }
    },
    
    [BRANCHES.STRANGER_GET_TO_KNOW]: {
      async execute(engine, state) {
        await engine.showText(`"That's... probably the nicest thing someone's said to me in a while."`, "Maya");
        await engine.showText("You begin walking together through the quiet evening streets.");
        await engine.showText("Maya tells you about her dreams of becoming an artist while working at the coffee shop.");
        
        await engine.showText(`"Most people just see the barista, you know? They don't ask about the person behind the counter."`, "Maya");
        
        RelationManager.addRelation(state.barista, 4);
        StatManager.addLust(state, 3);
        
        await engine.showChoices([
          { text: 'I see an incredibly talented and beautiful woman', branch: BRANCHES.STRANGER_BEAUTIFUL_WOMAN }
        ]);
      }
    },
    
    [BRANCHES.STRANGER_BEAUTIFUL_WOMAN]: {
      async execute(engine, state) {
        await engine.showText("Maya stops walking and turns to face you, her eyes wide with surprise.");
        await engine.showText(`"You really mean that, don't you?"` + ` she asks softly.`);
        await engine.showText("The evening light catches her features beautifully as she looks at you with newfound vulnerability.");
        
        RelationManager.addRelation(state.barista, 5);
        StatManager.addLust(state, 6);
        
        await engine.showChoices([
          { text: 'Every word. You take my breath away', branch: 'early-take-breath-away' },
          { text: 'Take her hand gently', branch: 'early-take-hand' },
          { text: 'I\'d love to show you how much I mean it', branch: 'early-show-how-much' }
        ]);
      }
    },
    
    [BRANCHES.FRIEND]: {
      async execute(engine, state) {
        await engine.showText(`"${state.player.name}! I was hoping you'd be here."`, "Maya");
        await engine.showText("Maya practically bounces over to you, her fatigue seemingly forgotten.");
        await engine.showText(`"I've been looking forward to this all afternoon. Work was so busy, but thinking about our walk kept me going."`, "Maya");
        
        RelationManager.addRelation(state.barista, 3);
        StatManager.addLust(state, 4);
        
        await engine.showChoices([
          { text: 'I\'ve been thinking about you too', branch: 'friend-thinking-about-you' },
          { text: 'You look beautiful even after a long day', branch: 'friend-beautiful-after-work' },
          { text: 'Put your arm around her shoulders', branch: 'friend-arm-around-shoulders' }
        ]);
      }
    },
    
    'friend-arm-around-shoulders': {
      async execute(engine, state) {
        await engine.showText("You gently put your arm around Maya's shoulders as you begin walking.");
        await engine.showText(`"Mmm, that feels nice,"` + ` she says, leaning into you slightly.`);
        await engine.showText("You walk together through the peaceful evening, her head occasionally resting against your shoulder.");
        
        await engine.showText("Maya points out little details about the neighborhood - a mural she loves, her favorite quiet spot in the park.");
        
        StatManager.addLust(state, 6);
        RelationManager.addRelation(state.barista, 4);
        
        await engine.showChoices([
          { text: 'I love seeing the world through your eyes', branch: 'friend-through-your-eyes' },
          { text: 'Stop and look at the stars together', branch: 'friend-look-at-stars' },
          { text: 'This feels perfectly right', branch: 'friend-feels-right' }
        ]);
      }
    },
    
    'friend-look-at-stars': {
      async execute(engine, state) {
        await engine.showText("You both stop in a quiet area of the park and look up at the emerging stars.");
        await engine.showText(`"I love this time of evening. It feels like the world slows down just for us,"` + ` Maya whispers.`);
        await engine.showText("She turns to face you, her eyes reflecting the starlight.");
        
        StatManager.addLust(state, 8);
        RelationManager.addRelation(state.barista, 5);
        
        await engine.showChoices([
          { text: 'Kiss her under the stars', branch: 'friend-kiss-under-stars' },
          { text: 'You\'re more beautiful than any star', branch: 'friend-more-beautiful-than-stars' },
          { text: 'Hold her close', branch: 'friend-hold-close' }
        ]);
      }
    },
    
    'friend-kiss-under-stars': {
      async execute(engine, state) {
        await engine.showText("You lean in and kiss Maya softly under the starlit sky.");
        await engine.showText("She melts into your arms, her lips soft and welcoming against yours.");
        await engine.showText(`"I've been wanting you to do that for so long,"` + ` she breathes against your lips.`);
        
        await engine.showText("The kiss deepens as you hold each other in the quiet park, lost in the moment.");
        
        StatManager.addLust(state, 12);
        RelationManager.addRelation(state.barista, 8);
        state.flags.maya_first_kiss = true;
        
        await engine.showChoices([
          { text: 'I\'ve been dreaming of this moment', branch: 'friend-dreaming-of-moment' },
          { text: 'You taste even better than I imagined', branch: 'friend-taste-better' },
          { text: 'I think I\'m falling for you', branch: 'friend-falling-for-you' }
        ]);
      }
    },
    
    [BRANCHES.CLOSE_FRIEND]: {
      async execute(engine, state) {
        await engine.showText("Maya rushes out of the coffee shop and straight into your arms.");
        await engine.showText(`"God, I missed you today,"` + ` she says, kissing you passionately right there on the street.`);
        await engine.showText(`"I kept watching the clock, counting down until I could be with you again."`, "Maya");
        
        await engine.showText("She takes your hand and intertwines your fingers as you begin walking.");
        
        RelationManager.addRelation(state.barista, 2);
        StatManager.addLust(state, 7);
        
        await engine.showChoices([
          { text: 'I couldn\'t concentrate on anything but you today', branch: 'intimate-couldnt-concentrate' },
          { text: 'Every minute apart feels like an eternity', branch: 'intimate-eternity-apart' },
          { text: 'I have something special planned for us', branch: 'intimate-something-special' }
        ]);
      }
    },
    
    'intimate-something-special': {
      async execute(engine, state) {
        await engine.showText(`"Really? What kind of special?"` + ` Maya asks with a mischievous smile.`);
        await engine.showText("Her eyes sparkle with anticipation as she squeezes your hand.");
        await engine.showText(`"You always know how to make me feel like the most important person in the world."`, "Maya");
        
        StatManager.addLust(state, 8);
        
        await engine.showChoices([
          { text: 'Because you ARE the most important person in my world', branch: 'intimate-most-important' },
          { text: 'I\'ve arranged a private dinner for us', branch: 'intimate-private-dinner' },
          { text: 'How about we go to your place?', branch: 'intimate-your-place' }
        ]);
      }
    },
    
    'intimate-your-place': {
      async execute(engine, state) {
        await engine.showText(`"I was hoping you'd suggest that,"` + ` Maya purrs.`);
        await engine.showText("She leads you toward her apartment, her hand warm in yours.");
        await engine.showText(`"I've been thinking about having you all to myself all day."`, "Maya");
        
        await engine.showText("The walk to her place feels both endless and too short as anticipation builds between you.");
        
        StatManager.addLust(state, 15);
        state.flags.maya_apartment_visit = true;
        
        await engine.showText("You spend the evening lost in each other's company, exploring your deep connection...");
      }
    }
  }
};

export default romanticWalk;