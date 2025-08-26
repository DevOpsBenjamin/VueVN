module.exports = {
  content: [
    './engine.html',
    './editor.html',
    './engine_src/**/*.{vue,js,ts,jsx,tsx}',
    './editor_src/**/*.{vue,js,ts,jsx,tsx}',
    './public/game/events/**/*.js',
  ],
  theme: {
    extend: {
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
      },
    },
  },
  plugins: [],
};
