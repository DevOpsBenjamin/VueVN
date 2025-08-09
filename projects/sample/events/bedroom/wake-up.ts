import type { VNEvent } from "@/engine/runtime/types";

const wakeUp: VNEvent = {
  id: "wake_up",
  name: "Wake Up",
  conditions: (state) => state.location === "bedroom" && !state.flags.wokeUp,
  async execute(engine, state) {
    await engine.showText("You wake up in your bedroom.");
    state.flags.wokeUp = true;
  },
};

export default wakeUp;
