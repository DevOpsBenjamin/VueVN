import type { VNEvent } from '@/engine/runtime/types';
// Import timing minigame to register it
import '@/minigames/TimingGameLogic';

const afterIntro: VNEvent = {
  id: 'after_intro',
  name: 'After Introduction - Bedroom',
  conditions: (state) => state.location === 'bedroom' && state.flags.introSeen && !state.flags.bedroomExplored,
  async execute(engine, state) {
    await engine.setBackground('assets/images/background/intro/hall.png');
    await engine.showText('You find yourself in a mysterious bedroom.', 'Narrator');
    
    // Test direct state manipulation
    if (!state.player.money) {
      state.player.money = 100;
    }
    
    await engine.showText(`You have ${state.player.money} money with you.`, 'Narrator');
    await engine.showText('There seems to be something interesting here...', 'Narrator');
    
    // Test setting flags
    state.flags.bedroomExplored = true;
    
    await engine.showText('What would you like to do?', 'Narrator');
    
    // This will trigger the choice event
    await engine.showChoices([
      { text: 'Investigate the room', id: 'investigate', jump_id: 'bedroom_choice' },
      { text: 'Look out the window', id: 'window', jump_id: 'bedroom_choice' },
      { text: 'Go back to sleep', id: 'sleep', jump_id: 'bedroom_choice' }
    ]);
    
    // Code after showChoices should never execute
    console.error('This should never be reached!');
  },
};

export default afterIntro;