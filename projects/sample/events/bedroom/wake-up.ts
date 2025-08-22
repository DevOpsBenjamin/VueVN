import type { VNEvent } from "@/engine/runtime/types";

const wakeUp: VNEvent = {
  id: "wake_up",
  name: "Wake Up",
  conditions: (state) => state.location === "bedroom" && !state.flags.wokeUp,
  async execute(engine, state) {
    await engine.setBackground('assets/images/background/intro/hall.png');
    await engine.showText("You wake up in your bedroom.", "Narrator");
    state.flags.wokeUp = true;
    await engine.showText("The room is quiet and peaceful.", "Narrator");
  },
};

export default wakeUp;
