import type { VNEvent } from '@generate/types';
import t from '@generate/texts';
// This make text acces simpler in file
const event_text = t.locations.bedroom.pc;

const use_pc: VNEvent = {
  name: 'Open computer',
  foreground: '/bedroom/images/background/night.png',
  conditions: (state) => state.flags.use_pc === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.use_pc = false;
    
    //we will do pron/game/study
    await engine.showText({ text: event_text.open }); 
  }
};

export default use_pc;