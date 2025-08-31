import type { VNEvent, GameState, EngineAPI } from '@generate/types';
import { RelationManager, StatManager, MoneyManager } from '@generate/engine';

export default {
  name: 'Stargazing with Sarah',
  foreground: 'assets/images/background/neighbor/night.png',
  
  conditions: (state: GameState) => {
    const hour = state.gameTime.hour;
    return state.flags.sarah_stargazing === true && (hour >= 21 || hour <= 2);
  },
  unlocked: (state: GameState) => state.neighbor.relationship === 'friend' || state.neighbor.relationship === 'close_friend',   
  locked: (state: GameState) => false,    
  
  async execute(engine: EngineAPI, state: GameState) {
    state.flags.sarah_stargazing = false;
    
    const relationshipLevel = state.neighbor.relationship;
    
    await engine.showText("The night is clear and filled with stars as you approach Sarah's house.");
    await engine.showText("You find her on a blanket in her backyard, gazing up at the celestial display.");
    
    await engine.showText(`"I was hoping you'd come tonight. The stars are absolutely magnificent."`, "Sarah");
    await engine.showText("She pats the blanket beside her, inviting you to lie down next to her.");
    
    if (relationshipLevel === 'friend') {
      await engine.jump('stars-friend');
    } else {
      await engine.jump('stars-intimate');
    }
  },
  
  branches: {
    'stars-friend': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("You lie down beside Sarah, close enough to feel her warmth but maintaining respectful distance.");
        await engine.showText(`"Look at that constellation there,"` + ` Sarah points to a cluster of stars.`);
        await engine.showText(`"My grandmother used to tell me stories about the star patterns when I was little."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 4);
        
        await engine.showChoices([
          { text: 'Tell me one of her stories', branch: 'stars-grandmother-stories' },
          { text: 'I love hearing about your childhood', branch: 'stars-love-childhood' },
          { text: 'Move a little closer to her', branch: 'stars-move-closer' }
        ]);
      }
    },
    
    'stars-move-closer': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("You shift on the blanket until your shoulder touches Sarah's.");
        await engine.showText(`"That's better,"` + ` she says softly, not moving away.`);
        await engine.showText("The warmth of her body against yours feels natural and comforting under the vast sky.");
        
        await engine.showText(`"You know, I used to come out here alone and feel so small under all these stars."`, "Sarah");
        await engine.showText(`"But with you here, I feel... complete."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 4);
        StatManager.addLust(state, 6);
        
        await engine.showChoices([
          { text: 'You complete me too', branch: 'stars-complete-me' },
          { text: 'The stars seem brighter with you here', branch: 'stars-brighter' },
          { text: 'Take her hand', branch: 'stars-take-hand' }
        ]);
      }
    },
    
    'stars-take-hand': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("You find Sarah's hand in the darkness and intertwine your fingers with hers.");
        await engine.showText(`"Your hand fits perfectly in mine,"` + ` she whispers.`);
        await engine.showText("You both lie there in comfortable silence, hands joined, watching meteors streak across the sky.");
        
        await engine.showText(`"Make a wish on that shooting star,"` + ` Sarah says suddenly.`);
        
        StatManager.addLust(state, 8);
        RelationManager.addRelation(state.neighbor, 5);
        
        await engine.showChoices([
          { text: 'I wish for more nights like this with you', branch: 'stars-wish-more-nights' },
          { text: 'My wish already came true when I met you', branch: 'stars-wish-came-true' },
          { text: 'What did you wish for?', branch: 'stars-what-wish' }
        ]);
      }
    },
    
    'stars-wish-more-nights': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("Sarah turns her head to look at you, her eyes shimmering with starlight.");
        await engine.showText(`"That's exactly what I wished for too,"` + ` she says breathlessly.`);
        await engine.showText("She rolls onto her side to face you fully, your faces inches apart on the blanket.");
        
        await engine.showText(`"I think the universe is trying to tell us something,"` + ` Sarah whispers.`);
        
        StatManager.addLust(state, 10);
        RelationManager.addRelation(state.neighbor, 6);
        
        await engine.showChoices([
          { text: 'Maybe it\'s telling us to stop holding back', branch: 'stars-stop-holding-back' },
          { text: 'I think it\'s telling us we\'re meant to be together', branch: 'stars-meant-together' },
          { text: 'Kiss her under the starlight', branch: 'stars-starlight-kiss' }
        ]);
      }
    },
    
    'stars-starlight-kiss': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("Under the canopy of infinite stars, you lean in and kiss Sarah tenderly.");
        await engine.showText("She responds immediately, her free hand coming up to caress your cheek.");
        
        await engine.showText(`"I've been dreaming of this moment,"` + ` she murmurs against your lips.`);
        await engine.showText("The kiss deepens as passion ignites between you under the watching stars.");
        
        StatManager.addLust(state, 15);
        RelationManager.addRelation(state.neighbor, 7);
        state.flags.sarah_starlight_kiss = true;
        
        await engine.showText("When you finally part, both breathless, another shooting star streaks overhead as if celebrating your union.");
      }
    },
    
    'stars-intimate': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("Sarah immediately cuddles up against your side as you lie down on the blanket.");
        await engine.showText(`"I've been waiting for you, my love,"` + ` she purrs into your ear.`);
        await engine.showText("Her hand traces patterns on your chest as you both gaze up at the stars.");
        
        await engine.showText(`"There's something so romantic about being under the infinite sky with the person you adore."`, "Sarah");
        
        RelationManager.addRelation(state.neighbor, 2);
        StatManager.addLust(state, 7);
        
        await engine.showChoices([
          { text: 'The stars pale compared to your beauty', branch: 'stars-pale-beauty' },
          { text: 'I want to make love to you under the stars', branch: 'stars-make-love' },
          { text: 'Roll over and kiss her passionately', branch: 'stars-passionate-kiss' }
        ]);
      }
    },
    
    'stars-make-love': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText(`"That sounds absolutely perfect,"` + ` Sarah breathes, pulling you closer.`);
        await engine.showText("She begins to unbutton your shirt, her movements slow and deliberate under the starlight.");
        
        await engine.showText("The cool night air, the vast sky above, and Sarah's passionate touch create an otherworldly experience.");
        await engine.showText("You make love with infinite tenderness as the cosmos bears witness to your union...");
        
        StatManager.addLust(state, 20);
        RelationManager.addRelation(state.neighbor, 5);
        state.flags.sarah_starlight_intimacy = true;
        
        await engine.showText("Afterwards, you hold each other close on the blanket, watching the stars slowly wheel overhead.");
        await engine.showText(`"I'll never look at the night sky the same way again,"` + ` Sarah whispers contentedly.`);
      }
    },
    
    'stars-passionate-kiss': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("You roll over and capture Sarah's lips in a deep, hungry kiss.");
        await engine.showText(`"Mmm, yes,"` + ` she moans softly, her arms wrapping around your neck.`);
        await engine.showText("Her legs tangle with yours as the passion builds between you.");
        
        await engine.showText("The blanket becomes your private world as you lose yourselves in desire under the watchful stars.");
        
        StatManager.addLust(state, 18);
        RelationManager.addRelation(state.neighbor, 4);
        
        await engine.showChoices([
          { text: 'Continue your passionate embrace', branch: 'stars-continue-passion' },
          { text: 'Whisper sweet things in her ear', branch: 'stars-sweet-whispers' },
          { text: 'Show her how much you desire her', branch: 'stars-show-desire' }
        ]);
      }
    },
    
    'stars-continue-passion': {
      async execute(engine: EngineAPI, state: GameState) {
        await engine.showText("Your passionate embrace intensifies as you both surrender to desire under the star-filled sky.");
        await engine.showText("Sarah's soft gasps of pleasure mingle with the gentle night breeze.");
        
        await engine.showText("Time seems to stop as you explore each other with growing urgency and love.");
        await engine.showText("The infinite stars above witness your most intimate and beautiful moments together...");
        
        StatManager.addLust(state, 25);
        state.flags.sarah_stars_ultimate = true;
        
        await engine.showText("Later, wrapped in each other's arms, you both drift off to sleep under nature's blanket of stars.");
      }
    }
  }
} satisfies VNEvent;