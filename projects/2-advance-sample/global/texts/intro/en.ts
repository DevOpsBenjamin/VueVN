export default {
  welcome: `Welcome to VueVN advance sample!
This project is to help developer of game to understand the structure of the game.
You can either start playing directly or learn a bit about the framework`,
  start_or_learn: "You can either start directly or learn about the framework",
  start_adventure: "Start the adventure",
  learn_more: "Learn more about VueVN",
  powerful_engine: `VueVN is a powerful TypeScript-based visual novel engine.
It is build to kinda mimic some renpy features.
And to be a more code oriented engine than the twine format`,
  supports_features: `It supports branching storylines, custom logic, and mini-games!
Even if you could do a traditional VN with it, it is more thinked for doing sandbox game
Game with an open world conception and event happening in it.`,
  read_or_start: "You can now read about key binding or start your adventure.",
  learn_keybinding: "Learn about KeyBinding",
  keybinding: `This VN engine is thinked for being able to play with onlye one hand (left hand only wink wink).
You can use Space/Arrow Right/E to continue forward.`,
  go_back: `You can use Arrow Left/Q to go back in history.
You can also use Number key to make choice that why it has a number on left.`,
  test_info: `You can use this few intro for testing the go back and go forward functionality.
As the engine is build for open world go back can only occur inside event context to reread text before choice or to do another choice
When you are in free roam between event go back do nothing`,
  skip_info: `You can hold also hold Ctrl To pass forward until next choice but can't pass choice`,
  demo_end: `For demo purpose after this dialogue the event will end and you will go back to before the event
The game loop will then replay the event and bring you to start of it until you chose to start the game`,
  start: `Great! Let's begin your adventure.
In this sample you will wake in your bedroom after passing this text.
You will be free to roam and discover at your time what the VN can do.`
} as const;