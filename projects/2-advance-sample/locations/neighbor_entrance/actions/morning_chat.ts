import type { Action } from '@generate/types';

const morningChat: Action = {
  id: 'morning_chat',
  name: "Chat with Sarah (Morning)",
  unlocked: (state) => {
    const hour = state.gameTime.hour;
    return hour >= 7 && hour <= 11;
  },
  execute: (state) => state.flags.neighbor_morning_chat = true
};

export default morningChat;