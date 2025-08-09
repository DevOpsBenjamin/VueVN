export default {
  id: 'wake_up',
  name: 'Wake Up',

  conditions: (state) => state.location === 'bedroom' && !state.flags.wokeUp,

  async execute(engine, state) {
    await engine.showText('You wake up in your bedroom.');
    state.flags.wokeUp = true;
    // Move to another location or continue story
  },
};
