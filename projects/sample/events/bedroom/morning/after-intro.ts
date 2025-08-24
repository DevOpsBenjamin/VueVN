import type { VNEvent } from '@/generate/types';
import { bedroom } from '@/generate/locations';

const afterIntro: VNEvent = {
  id: 'after-intro',
  name: 'After Introduction',
  conditions: (state) => state.location_id === bedroom.id,
  unlocked: (state) => state.flags.introSeen,
  locked: (state) => state.flags.introAct,
  
  async execute(engine, state) {
    engine.setForeground('assets/images/background/bedroom/morning.png');
    await engine.showText('You find yourself in your cozy bedroom.');
    await engine.showText('Sunlight streams through the window.');
    await engine.showText('What would you like to do?');
    
    const choice = await engine.showChoices([
      { text: 'Explore the room', branch: 'explore_room' },
      { text: 'Check your phone', branch: 'check_phone' },
      { text: 'Go back to sleep', branch: 'go_sleep' }
    ]);
  },

  branches: {
    explore_room: {
      async execute(engine, state) {
        state.flags.introAct = true;
        state.flags.exploredRoom = true;
        await engine.showText("You look around your bedroom carefully.");
        await engine.showText("You notice some interesting books on your shelf.");
        await engine.showText("There's also a mysterious box under your bed...");
        // Reste dans bedroom, d'autres événements peuvent apparaître
      }
    },
    
    check_phone: {
      async execute(engine, state) {
        state.flags.introAct = true;
        state.flags.checkedPhone = true;
        await engine.showText("You pick up your phone from the nightstand.");
        await engine.showText("You have 3 missed messages from your friend Alex.");
        await engine.showText("Maybe you should reply later...");
      }
    },
    
    go_sleep: {
      async execute(engine, state) {
        state.flags.introAct = true;
        state.flags.triedSleep = true;
        await engine.showText("You try to go back to sleep...");
        await engine.showText("But you're too excited about your adventure!");
        await engine.showText("You decide to get up instead.");
      }
    }
  }
};

export default afterIntro;