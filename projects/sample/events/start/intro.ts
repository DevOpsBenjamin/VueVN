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
    await engine.showText('This is your first VN engine experience.');
    await engine.showText('You can use Arrow Left/Q to go back in history.');
    await engine.showText('You can use Space/Arrow Right/E to continue forward.');
    state.npc_1.relation +=1;
    if (state.npc_1.relation > 3) {
      await engine.showText('You are close to npc_1.name');
    }
    else {
      await engine.showText('You are not close enough to npc_1.name');
    }
    await engine.showText('This is your first event with multiple text entries.');
    await engine.showText('Perfect for testing the go back and go forward functionality.');
    await engine.showText('Each of these text lines should be a separate history entry.');
    
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
