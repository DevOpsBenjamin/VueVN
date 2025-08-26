module.exports = {
  content: [
    './game.html',
    './index.html',
    './engine_src/**/*.{vue,js,ts,jsx,tsx}',
    './editor_src/**/*.{vue,js,ts,jsx,tsx}',
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
