import type { VNEvent } from '@/generate/types';

const intro: VNEvent = {
  id: 'intro',
  name: 'Introduction',
  conditions: () => true,
  unlocked: () => true,
  locked: (state) => state.flags.introSeen, // Se verrouille seulement après "start adventure"
  
  async execute(engine, state) {
    await engine.setForeground('assets/images/background/intro/hall.png');
    await engine.showText('Welcome to VueVN game sample! You can either start directly or learn about the framework');
    await engine.showChoices([
      { text: 'Start the adventure', branch: 'start_adventure' },
      { text: 'Learn more about VueVN', branch: 'learn_more' },
      { text: 'Debug MiniGame', branch: 'debug_minigame' },
    ]);
  },

  branches: {
    learn_more: {
      async execute(engine, state) {        
        await engine.showText("VueVN is a powerful TypeScript-based visual novel engine.");
        await engine.showText("It is build to kinda mimic renpy features.");
        await engine.showText("It supports branching storylines, custom logic, and mini-games!");
        await engine.showText("You can now read about key binding or start your adventure.");
        await engine.showChoices([
          { text: 'Start the adventure', branch: 'start_adventure' },
          { text: 'Learn about KeyBinding', branch: 'learn_key' },
        ]);
      }
    },
    learn_key: {
      async execute(engine, state) {       
        await engine.showText('This VN engine is thinked for playing one hand (left hand only wink wink).');
        await engine.showText('You can use Space/Arrow Right/E to continue forward.'); 
        await engine.showText('You can use Arrow Left/Q to go back in history.');
        await engine.showText('Perfect for testing the go back and go forward functionality.');
        await engine.showText('Each of these text lines should be a separate history entry.');
        await engine.showText('You can hold Ctrl To pass until choice');
        await engine.showText("For demo purpose this will end the event after this text and you will go back to intro.");
      }
    },    
    start_adventure: {
      async execute(engine, state) {    
        state.flags.introSeen = true; // Verrouille l'intro
        state.location = 'bedroom';
        await engine.showText("Great! Let's begin your adventure.");
        await engine.showText("You head to your bedroom to start your journey.");
      }
    },
    
    debug_minigame: {
      async execute(engine, state) {
        // Branch minimale pour tester le mini-jeu directement
        await engine.showText("Starting debug minigame...");
        /*
        // Lance le mini-jeu - il gère tout lui-même
        await engine.runCustomLogic('timingMinigame', { 
          difficulty: 1,
          context: 'debug_mode'
        });
        */
        // Pas de code après - retour à l'intro naturellement
      }
    }
  }
};

export default intro;