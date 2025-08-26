import type { VNEvent } from '@generate/types';
import bedroom from '@generate/locations/bedroom'

const intro: VNEvent = {
  name: 'Introduction',
  foreground: 'assets/images/background/intro/hall.png',
  conditions: () => true,
  unlocked: () => true,
  locked: (state) => state.flags.introSeen, // Se verrouille seulement après "start adventure"
  
  async execute(engine, state) {
    const multiline_text = `Welcome to VueVN game sample!
This project is to help developer of game to understand the structure of the game.
You can either start directly or learn about the framework`;
    await engine.showText(multiline_text);
    await engine.showChoices([
      { text: 'Start the adventure', branch: 'start_adventure' },
      { text: 'Learn more about VueVN', branch: 'learn_more' },
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
        await engine.showText('This VN engine is thinked for playing one hand (left hand only wink wink).', 'System');
        await engine.showText('You can use Space/Arrow Right/E to continue forward.', 'System'); 
        await engine.showText('You can use Arrow Left/Q to go back in history.', 'System');
        await engine.showText('You can also use Number key to make choice that why it has a number on left.', 'System');
        await engine.showText('Perfect for testing the go back and go forward functionality.', 'System');
        await engine.showText('You can hold Ctrl To pass until choice but can\'t pass choice', 'System');
        await engine.showText("For demo purpose this will end the event after this text and you will go back to intro.", 'System');
      }
    },    
    start_adventure: {
      async execute(engine, state) {    
        state.flags.introSeen = true; // Verrouille l'intro
        state.location_id = bedroom.id;
        await engine.showText("Great! Let's begin your adventure.");
        await engine.showText("You head to your bedroom to start your journey.");
      }
    }
  }
};

export default intro;