import type { VNEvent } from '@/engine/runtime/types';

const bedroomChoice: VNEvent = {
  id: 'bedroom_choice',
  name: 'Bedroom Choice Event',
  conditions: (state) => state.flags.bedroomExplored,
  async execute(engine, state) {
    await engine.showText('You decided to explore further...', 'Narrator');
    
    // Conditional logic based on previous state
    if (state.player.money >= 100) {
      await engine.showText('Your money feels heavy in your pocket.', 'Narrator');
    }
    
    await engine.showText('Suddenly, you notice a strange device on the table.', 'Narrator');
    await engine.showText('It appears to be some kind of timing game...', 'Narrator');
    
    await engine.showChoices([
      { text: 'Try the timing game', id: 'timing', jump_id: 'timing_event' },
      { text: 'Examine the device closer', id: 'examine', jump_id: 'timing_event' },
      { text: 'Ignore it and continue exploring', id: 'ignore', jump_id: 'timing_event' }
    ]);
    
    // This code should never execute
    console.error('Choice event: This should never be reached!');
  },
};

export default bedroomChoice;