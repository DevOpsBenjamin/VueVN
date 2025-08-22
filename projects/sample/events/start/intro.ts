import type { VNEvent } from '@/engine/runtime/types';

const intro: VNEvent = {
  id: 'intro',
  name: 'Introduction',
  conditions: () => true,
  unlocked: () => true,
  locked: (state) => state.flags.introSeen,
  async execute(engine, state) {
    await engine.setForeground('assets/images/background/intro/hall.png');
    await engine.showText('Welcome to sample!');
    state.npc_1.relation +=1;
    await engine.showText('This is your first event.');
    
    // Test basic choices without automatic jumps (old pattern converted)
    const choice = await engine.showChoices([
      { text: 'Start the adventure', id: 'start', jump_id: 'after_intro' },
      { text: 'Learn more about VueVN', id: 'learn', jump_id: 'intro_learn' },
    ]);

    // The event should end here due to jump, but keeping as fallback
    if (choice === 'start') {
      await engine.showText("Great! Let's begin your adventure.");
      state.flags.introSeen = true;
      state.location = 'bedroom';
    }
  },
};

export default intro;
