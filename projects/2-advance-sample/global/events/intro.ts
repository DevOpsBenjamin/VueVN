import type { VNEvent } from '@generate/types';
import t from '@generate/texts';
// This make text acces simpler in file
const event_text = t.global.intro;

const intro: VNEvent = {
  name: 'Introduction',
  foreground: '/global/images/intro/welcome.png',
  conditions: () => true,
  unlocked: () => true,
  locked: (state) => state.flags.introSeen, // Locks only after "start adventure"
  
  async execute(engine, state) {
    await engine.showText(event_text.welcome);
    await engine.showChoices([
      { text: event_text.start_adventure, branch: 'start_adventure' },
      { text: event_text.learn_more, branch: 'learn_more' },
    ]);
  },

  branches: {
    learn_more: {
      async execute(engine, _) {        
        await engine.showText(event_text.powerful_engine );
        await engine.showText(event_text.supports_features);
        await engine.showText(event_text.read_or_start);
        await engine.showChoices([
          { text: event_text.start_adventure, branch: 'start_adventure' },
          { text: event_text.learn_keybinding, branch: 'learn_key' },
        ]);
        // After choice every code is ignored this is a volontary bad event
        // So the user if running in editor mode can see the warning planned to help game creator see bad event code.
        await engine.showText("ERROR FOR ENGINE DEBUG DEMO");
      }
    },
    learn_key: {
      async execute(engine, _) {       
        await engine.showText(event_text.keybinding, 'System');
        await engine.showText(event_text.go_back, 'System'); 
        await engine.showText(event_text.test_info, 'System');
        await engine.showText(event_text.skip_info, 'System');
        await engine.showText(event_text.demo_end, 'System');
        // The event will end and game loop continue as event condition is still true it will pop again in next game loop.
      }
    },    
    start_adventure: {
      async execute(engine, state) {    
        state.flags.introSeen = true; // Lock the intro
        await engine.showText(event_text.start);
      }
    }
  }
};

export default intro;