import type { VNEvent } from '@generate/types';
import { TimeHelper } from '@generate/engine';
import texts from '@generate/texts';
// This make text acces simpler in file
const t = texts.locations.bedroom.sleep;

const try_sleep: VNEvent = {
  name: 'Go to Sleep',
  foreground: '/bedroom/images/background/night.png',
  conditions: (state) => state.flags.try_sleep === true,
  unlocked: () => true,
  locked: () => false,

  async execute(engine, state) {
    // Reset the sleep flag immediately
    state.flags.try_sleep = false;
    // Full sleep - reset daily activities and restore energy
    state.player.daily = {};
    state.barista.daily = {};
    state.neighbor.daily = {};
    state.player.energy = 100;
    TimeHelper.sleep(state.gameTime);
    await engine.showText({ text: t.sleep });
    await engine.showText("...");
    await engine.showText("...");
    await engine.showText({ text: t.wake_up });
  }
};

export default try_sleep;
