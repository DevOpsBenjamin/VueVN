export default {
  id: 'intro',
  name: 'Introduction',

  // This event triggers when entering the 'start' location
  conditions: (state) => true,
  unlocked: (state) => true,
  locked: (state) => state.flags.introSeen,

  async execute(engine, state) {
    // Set background
    engine.setBackground('/assets/images/background/intro/hall.jpg');

    // Show some text
    await engine.showText('Welcome to sample!');
    await engine.showText('This is your first event.');

    // Show a choice
    const choice = await engine.showChoices([
      { text: 'Start the adventure', id: 'start' },
      { text: 'Learn more', id: 'learn' },
    ]);

    if (choice === 'learn') {
      await engine.showText('VueVN is a visual novel engine built with Vue 3.');
      await engine.showText(
        'You can create your own stories by adding events and assets.'
      );
    }

    // Mark intro as seen
    state.flags.introSeen = true;

    // Change location (this will trigger new events)
    state.location = 'chapter1';
  },
};
