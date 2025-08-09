import type { VNEvent } from '@/engine/runtime/types';

const intro: VNEvent = {
  id: 'intro',
  name: 'Introduction',
  conditions: () => true,
  unlocked: () => true,
  locked: (state) => state.flags.introSeen,
  async execute(engine, state) {
    engine.setForeground("assets/images/background/intro/hall.png");
    await engine.showText("Welcome to sample!");
    await engine.showText("This is your first event.");
    let choice = "";
    while (choice !== "start") {
      choice = await engine.showChoices([
        { text: "Start the adventure", id: "start" },
        { text: "Learn more", id: "learn" },
      ]);

      if (choice === "learn") {
        await engine.showText(
          "VueVN is a visual novel engine built with Vue 3.",
        );
        await engine.showText(
          "You can create your own stories by adding events and assets.",
        );
        await engine.showChoices([{ text: "Return", id: "return" }]);
      }
    }

    await engine.showText("Great! Let's begin your adventure.");
    state.flags.introSeen = true;
    state.location = "bedroom";
  },
};

export default intro;
