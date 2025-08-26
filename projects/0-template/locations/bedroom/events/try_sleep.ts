import type { VNEvent } from '@generate/types';
import { TimeHelper } from '@generate/engine';

const try_sleep: VNEvent = {
  name: 'Go to Sleep',
  foreground: 'assets/images/background/bedroom/night.png',
  conditions: (state) => state.flags.try_sleep === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    // Reset the sleep flag immediately
    state.flags.try_sleep = false;
    // Full sleep - reset daily activities and restore energy
    state.player.flags = {};
    state.player.stat = 100;
    TimeHelper.sleep(state.gameTime);
    await engine.showText("You lie down on your comfortable bed and close your eyes.");
    await engine.showText("...");
    await engine.showText("You wake up feeling refreshed and ready for a new day!");    
  }
};

export default try_sleep;