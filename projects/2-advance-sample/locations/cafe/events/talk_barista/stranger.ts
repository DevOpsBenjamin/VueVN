import type { VNEvent } from '@generate/types';
import { RelationManager, StatManager, MoneyManager } from '@generate/engine';
import { RelationLevel } from '@generate/enums';
import text from '@generate/texts';

// Shortcut to text
const t = text.locations.cafe.talk_barista_stranger;

const BRANCH = {
  ORDER_COFFEE: "order-coffee",
  BROWSING: "just-browsing",
  START_CONVERSATION: "start-conversation",
  ASK_HISTORY: "ask-history",
  LEAVE: "leave-cafe",
} as const;

const talkStranger: VNEvent = {
  name: 'Talk to Maya',
  foreground: '/cafe/images/foreground/barista.png',
  conditions: (state) => state.barista.daily.talk_stranger === true,
  unlocked: () => true,
  locked: () => false,

  async execute(engine, state) {
    state.barista.daily.talk_stranger = false;

    await engine.showText({ text: t.stranger_hi, from: "Barista" });
    await engine.showText({ text: t.stranger_smiles });
    await engine.showChoices([
      { text: t.choice_order, branch: BRANCH.ORDER_COFFEE },
      { text: t.choice_browse, branch: BRANCH.BROWSING },
      { text: t.choice_start_conversation, branch: BRANCH.START_CONVERSATION }
    ]);
  },

  branches: {
    [BRANCH.ORDER_COFFEE]: {
      async execute(engine, state) {
        //Handling is user already know her name or not.
        let from = 'Barista';
        if (state.barista.relationship != RelationLevel.STRANGER) {
          from = state.barista.name;
        }
        if (MoneyManager.spendPocket(state, 3)) {
          StatManager.addEnergy(state, 15);
          await engine.showText({ text: t.order_here_your_coffee, from: from });
          await engine.showText({ text: t.order_excellent_energy });
          await engine.showText({ text: t.order_energy_money, variables: { cash: state.player.pocketMoney } });
        } else {
          await engine.showText({ text: t.order_short_money, from: from });
          await engine.showText({ text: t.order_not_enough, variables: { cash: state.player.pocketMoney } });
        }
      }
    },

    [BRANCH.BROWSING]: {
      async execute(engine, _) {
        await engine.showText({ text: t.just_browsing_take_time, from: "Barista" });
        await engine.showText({ text: t.just_browsing_back_to_work });
      }
    },

    [BRANCH.START_CONVERSATION]: {
      async execute(engine, state) {
        var player_from = state.player.name;
        var blurp_name = `${player_from.slice(0, 2)}—uh, ${player_from}`;
        //NO MORE STRANGER
        state.barista.relationship = RelationLevel.ACQUAINTANCE;
        await engine.showText({ text: t.stranger_ask_name, from: player_from });
        await engine.showText({ text: t.stranger_barista_name, from: "Barista" });
        await engine.showText({ text: t.stranger_player_blurp, from: player_from, variables: { name: blurp_name } });
        await engine.showText({ text: t.stranger_blurp });
        await engine.showText({ text: t.stranger_player_weird, from: player_from, variables: { name: player_from } });
        await engine.showText({ text: t.stranger_barista_nice, from: state.barista.name, variables: { name: player_from } });
        RelationManager.addRelation(state.barista, 5);
        StatManager.addLust(state, 2);
        await engine.showText({ text: t.start_seems_friendly });
        await engine.showChoices([
          { text: t.choice_order_now, branch: BRANCH.ORDER_COFFEE },
          { text: t.choice_ask_history, branch: BRANCH.ASK_HISTORY }
        ]);
      }
    },

    [BRANCH.ASK_HISTORY]: {
      async execute(engine, state) {
        await engine.showText({ text: t.ask_work_history, from: state.player.name });
        await engine.showText({ text: t.ask_work_history_answer, from: state.barista.name });
        await engine.showText({ text: t.ask_work_history_enthusiasm });
        RelationManager.addRelation(state.barista, 3);

        await engine.showChoices([
          { text: t.choice_order, branch: BRANCH.ORDER_COFFEE },
          { text: t.choice_leave, branch: BRANCH.LEAVE }
        ]);
      }
    },
  }
}

export default talkStranger;
