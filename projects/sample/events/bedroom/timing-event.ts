import type { VNEvent } from '@/engine/runtime/types';

const timingEvent: VNEvent = {
  id: 'timing_event',
  name: 'Timing Game Event',
  conditions: (state) => state.flags.bedroomExplored,
  async execute(engine, state) {
    await engine.showText('You approach the mysterious timing device.', 'Narrator');
    await engine.showText('It has a spinning circle with colored zones...', 'Narrator');
    
    // Show current money before minigame
    await engine.showText(`Current money: ${state.player.money}`, 'System');
    
    await engine.showText('The device activates! Click to stop the spinner!', 'System');
    
    // Run the timing minigame - this will exit the event flow
    await engine.runCustomLogic('timingMinigame', {
      difficulty: 2,
      reward: 150
    });
    
    // This code should never execute because runCustomLogic exits the event
    console.error('Timing event: This should never be reached after runCustomLogic!');
  },
};

export default timingEvent;