export default {
  welcome: `Welcome to the VueVN advanced sample!
This project helps game developers understand the game's structure.
You can either start playing directly or learn a bit about the framework`,
  start_adventure: "Start the adventure",
  learn_more: "Learn more about VueVN",
  powerful_engine: `VueVN is a powerful TypeScript-based visual novel engine.
It is built to mimic some Ren'Py features.
It's designed to be a more code-oriented engine than the Twine format`,
  supports_features: `It supports branching storylines, custom logic, and mini-games!
Even though you could create a traditional VN with it, it's more designed for sandbox games.
Games with an open world concept and events happening within it.`,
  read_or_start: "You can now read about key bindings or start your adventure.",
  learn_keybinding: "Learn about Key Bindings",
  keybinding: `This VN engine is designed to be playable with only one hand (left hand only, wink wink).
You can use Space/Right Arrow/E to continue forward.`,
  go_back: `You can use Left Arrow/Q to go back in history.
You can also use number keys to make choices - that's why there's a number on the left.`,
  test_info: `You can use this brief intro to test the go back and go forward functionality.
Since the engine is built for open world gameplay, going back can only occur within event contexts to reread text before choices or make different choices.
When you're in free roam between events, going back does nothing.`,
  skip_info: `You can also hold Ctrl to skip forward until the next choice, but you can't skip past choices.`,
  demo_end: `For demo purposes, after this dialogue the event will end and you will go back to before the event.
The game loop will then replay the event and bring you to the start until you choose to begin the game.`,
  start: `Great! Let's begin your adventure.
In this sample, you will wake up in your bedroom after this text.
You will be free to roam and discover at your own pace what the VN engine can do.`
} as const;