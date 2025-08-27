import type { VNEvent } from '@generate/types';
import { RelationManager, StatManager } from '@generate/engine';

const privateCoffeeDate: VNEvent = {
  name: 'Private Coffee Date with Maya',
  foreground: 'assets/images/background/cafe/closed.png',
  conditions: (state) => state.flags.maya_private_date === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.maya_private_date = false;
    
    const hour = state.gameTime.hour;
    const relationshipLevel = state.barista.relationship;
    
    // Action unlocked conditions already ensure close_friend relationship and after-hours timing
    
    await engine.showText("You arrive at the coffee shop after closing time. Maya has left the door unlocked for you.");
    await engine.showText("The shop is dimly lit with just a few warm lights, creating an intimate atmosphere.");
    await engine.showText("Maya emerges from behind the counter wearing a flowing dress you've never seen before.");
    
    await engine.showText(`"Welcome to our private café,"` + ` she says with a sultry smile.`);
    
    RelationManager.addRelation(state.barista, 2);
    StatManager.addLust(state, 8);
    
    await engine.showChoices([
      { text: 'You look absolutely stunning tonight', branch: 'intimate-stunning-tonight' },
      { text: 'This is incredibly romantic', branch: 'intimate-incredibly-romantic' },
      { text: 'I\'ve been dreaming about having you all to myself', branch: 'intimate-dreaming-about' }
    ]);
  },
  
  branches: {
    'intimate-stunning-tonight': {
      async execute(engine, state) {
        await engine.showText(`"I wanted to look special for you,"` + ` Maya says, doing a little twirl.`);
        await engine.showText("The dress flows around her gracefully, and you can't take your eyes off her.");
        await engine.showText(`"I've been planning this all week. Just you, me, and all the time in the world."`, "Maya");
        
        StatManager.addLust(state, 5);
        RelationManager.addRelation(state.neighbor, 2);
        
        await engine.showChoices([
          { text: 'You succeeded beyond my wildest dreams', branch: 'intimate-beyond-dreams' },
          { text: 'Every detail about you is perfect', branch: 'intimate-every-detail-perfect' },
          { text: 'Come here and let me show you how stunning you are', branch: 'intimate-show-stunning' }
        ]);
      }
    },
    
    'intimate-show-stunning': {
      async execute(engine, state) {
        await engine.showText("Maya walks slowly toward you, her eyes never leaving yours.");
        await engine.showText("When she reaches you, you pull her close and cup her face gently in your hands.");
        await engine.showText(`"Show me,"` + ` she whispers, her voice husky with desire.`);
        
        await engine.showText("You kiss her deeply, pouring all your admiration and desire into the moment.");
        
        StatManager.addLust(state, 10);
        
        await engine.showChoices([
          { text: 'Press her against the counter', branch: 'intimate-against-counter' },
          { text: 'Whisper how much you want her', branch: 'intimate-whisper-want' },
          { text: 'Let your hands explore her curves', branch: 'intimate-explore-curves' }
        ]);
      }
    },
    
    'intimate-against-counter': {
      async execute(engine, state) {
        await engine.showText("You gently press Maya back against the coffee counter, your bodies close together.");
        await engine.showText(`"Yes,"` + ` she breathes, her arms wrapping around your neck.`);
        await engine.showText("Her back arches as you kiss along her collarbone, the familiar scent of coffee mixing with her perfume.");
        
        await engine.showText(`"I've fantasized about this so many times while working here,"` + ` she confesses breathlessly.`);
        
        StatManager.addLust(state, 12);
        
        await engine.showChoices([
          { text: 'Tell me about those fantasies', branch: 'intimate-tell-fantasies' },
          { text: 'Let\'s make them all come true', branch: 'intimate-make-true' },
          { text: 'You drive me wild with desire', branch: 'intimate-drive-wild' }
        ]);
      }
    },
    
    'intimate-tell-fantasies': {
      async execute(engine, state) {
        await engine.showText(`"I imagined you coming in after hours, just like this,"` + ` Maya whispers.`);
        await engine.showText("Her hands trace patterns on your chest as she speaks.");
        await engine.showText(`"I thought about you pushing me against this very counter, kissing me until I couldn't think straight."`, "Maya");
        
        await engine.showText(`"And then..."` + ` she pauses, biting her lip playfully.`);
        
        StatManager.addLust(state, 15);
        
        await engine.showChoices([
          { text: 'And then what, beautiful?', branch: 'intimate-and-then-what' },
          { text: 'Your fantasies are about to become reality', branch: 'intimate-become-reality' },
          { text: 'Kiss her passionately to silence her words', branch: 'intimate-silence-words' }
        ]);
      }
    },
    
    'intimate-become-reality': {
      async execute(engine, state) {
        await engine.showText(`"Promise?"` + ` Maya asks, her eyes dark with desire.`);
        await engine.showText("She pulls you closer, her body pressing against yours with obvious need.");
        await engine.showText(`"I want you so much it hurts,"` + ` she confesses.`);
        
        await engine.showText("The coffee shop becomes your private sanctuary as you explore your deepest desires together...");
        
        StatManager.addLust(state, 20);
        state.flags.maya_coffee_shop_intimate = true;
        
        await engine.showText("Hours later, you lie together on the comfortable couch in the back office, completely satisfied.");
        await engine.showText(`"I'll never look at this place the same way again,"` + ` Maya laughs softly.`);
      }
    },
    
    'intimate-incredibly-romantic': {
      async execute(engine, state) {
        await engine.showText(`"I wanted our first real date to be somewhere special to me,"` + ` Maya says.`);
        await engine.showText("She takes your hand and leads you to a small table she's set with candles and flowers.");
        await engine.showText(`"This is where I fell for you, watching you come in every day with that beautiful smile."`, "Maya");
        
        RelationManager.addRelation(state.barista, 4);
        StatManager.addLust(state, 6);
        
        await engine.showChoices([
          { text: 'You fell for me?', branch: 'intimate-fell-for-me' },
          { text: 'This place will always be special to us', branch: 'intimate-always-special' },
          { text: 'I love that you chose to share this with me', branch: 'intimate-share-this' }
        ]);
      }
    },
    
    'intimate-fell-for-me': {
      async execute(engine, state) {
        await engine.showText(`"Completely and utterly,"` + ` Maya admits, her cheeks flushing pink.`);
        await engine.showText("She looks down shyly, then back up at you with vulnerability in her eyes.");
        await engine.showText(`"I tried to fight it at first - you were a customer. But every conversation made me fall deeper."`, "Maya");
        
        StatManager.addLust(state, 8);
        RelationManager.addRelation(state.barista, 5);
        
        await engine.showChoices([
          { text: 'I\'ve been falling for you too', branch: 'intimate-falling-too' },
          { text: 'I\'m so glad you stopped fighting it', branch: 'intimate-stopped-fighting' },
          { text: 'Kiss her tenderly', branch: 'intimate-tender-kiss' }
        ]);
      }
    },
    
    'intimate-tender-kiss': {
      async execute(engine, state) {
        await engine.showText("You lean across the small table and kiss Maya with infinite tenderness.");
        await engine.showText("She sighs softly into the kiss, her hand coming up to cup your cheek.");
        await engine.showText(`"I love you,"` + ` she whispers against your lips.`);
        
        await engine.showText("The words hang in the air between you, vulnerable and beautiful.");
        
        StatManager.addLust(state, 10);
        RelationManager.addRelation(state.barista, 8);
        state.flags.maya_love_confession = true;
        
        await engine.showChoices([
          { text: 'I love you too, Maya', branch: 'intimate-love-you-too' },
          { text: 'You\'re everything I\'ve ever wanted', branch: 'intimate-everything-wanted' },
          { text: 'Show her how much with your actions', branch: 'intimate-show-with-actions' }
        ]);
      }
    },
    
    'intimate-love-you-too': {
      async execute(engine, state) {
        await engine.showText(`"Really? You really love me?"` + ` Maya's eyes fill with happy tears.`);
        await engine.showText("You nod, taking both her hands in yours across the candlelit table.");
        await engine.showText(`"I never thought I'd find someone who could love all of me,"` + ` she says softly.`);
        
        await engine.showText("The rest of the evening unfolds like a beautiful dream - intimate conversation, passionate kisses, and the deep contentment of mutual love.");
        
        StatManager.addLust(state, 15);
        RelationManager.addRelation(state.barista, 10);
        
        await engine.showText("This private coffee date becomes the foundation of something beautiful and lasting between you.");
      }
    }
  }
};

export default privateCoffeeDate;