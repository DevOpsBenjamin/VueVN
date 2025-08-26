import type { VNEvent } from '@generate/types';
import bedroom from '@generate/locations/bedroom';

const timingEvent: VNEvent = {
  name: 'Timing Challenge',
  foreground: '/bedroom/images/background/morning.png',
  conditions: (state) => state.location_id === bedroom.id,
  unlocked: (state) => state.flags.introSeen && state.flags.triedSleep,
  locked: (state) => state.flags.timingCompleted,
  
  async execute(engine, state) {
    await engine.showText("Suddenly, you hear your alarm clock acting strange...");
    await engine.showText("It's beeping in a weird pattern - almost like a code!");
    await engine.showText("Maybe if you can match the timing, something will happen?");
    
    // The minigame handles everything itself - no code after
    /*
    await engine.runCustomLogic('timingMinigame', { 
      difficulty: 2,
      context: 'alarm_clock' // Context so the minigame knows what to do
    });
    */
    
    // ❌ NO MORE CODE HERE - the minigame handles its consequences
    // The event ends here, the game loop restarts after the minigame
  }
};

export default timingEvent;