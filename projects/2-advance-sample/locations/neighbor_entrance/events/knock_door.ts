import type { VNEvent } from '@generate/types';
import { RelationLevel } from '@generate/enums';

const knock_door: VNEvent = {
  name: 'Knock on Neighbor Door',
  foreground: 'assets/images/background/neighbor/entrance.png',
  conditions: (state) => state.flags.knock_door === true && (state.gameTime.hour >= 9 && state.gameTime.hour <= 16),
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.knock_door = false; 
    await engine.showText("You stand in front of your neighbor's door.");
    await engine.showText("*knock knock*");
    
    // Check relation level for different responses
    const relationStatus = state.neighbor.relationship;
    
    if (relationStatus === RelationLevel.STRANGER) {
      await engine.showText("The door opens slightly. A suspicious face peers out.");
      await engine.showText("'Who are you? What do you want?'", "Neighbor");
    } else if (relationStatus === RelationLevel.ACQUAINTANCE) {
      await engine.showText("The door opens. Your neighbor recognizes you.");
      await engine.showText("'Oh, it's you. What brings you here?'", `${state.neighbor.name}`);
    } else if (relationStatus === RelationLevel.FRIEND) {
      await engine.showText("The door opens with a smile.");
      await engine.showText("'Hey there! Nice to see you again!'", `${state.neighbor.name}`);
    } else if (relationStatus === RelationLevel.CLOSE_FRIEND) {
      await engine.showText("The door swings open warmly.");
      await engine.showText("'My friend! Come in, come in!'", `${state.neighbor.name}`);
    }
    await engine.showChoices([
      { text: 'Say hello and chat', branch: 'chat' }
    ]);
  },

  branches: {
    chat: {
      async execute(engine, state) {
        const currentRelation = state.neighbor.relation;
        const relationStatus = state.neighbor.relationship;

        if (relationStatus === RelationLevel.STRANGER) {
          state.neighbor.relationship = RelationLevel.ACQUAINTANCE;
          await engine.showText(`Hello i'm ${state.player.name} your new neighbor nice to meet you!`, `${state.player.name}`);
          await engine.showText(`Hello ${state.player.name} my name is ${state.neighbor.name}, nice to meet you young man!`, `${state.neighbor.name}`);
          await engine.showText(`My mom told me to come to present myself and invite you to join us on diner so we can meet our new neighboor.\nWould you be available tonight?`, `${state.player.name}`);
          state.flags.dinner_invite = true;
          await engine.showText(`Of course it would be a pleasure, I didn't really talk to previous neighbor!\nIt's nice to have friendly one for a change. See you tonight then`, `${state.neighbor.name}`);
        }
        else {
          state.neighbor.relation = Math.min(currentRelation + 1, 100);
          await engine.showText("You have a pleasant conversation with your neighbor.");
          await engine.showText("They seem to warm up to you a bit more.", "System");
        }

        // Update relationship status based on relation points
        if (state.neighbor.relation >= 30 && state.neighbor.relationship === RelationLevel.ACQUAINTANCE) {
          state.neighbor.relationship = RelationLevel.FRIEND;
          await engine.showText("You sense a real friendship forming!", "System");
        } else if (state.neighbor.relation >= 60 && state.neighbor.relationship === RelationLevel.FRIEND) {
          state.neighbor.relationship = RelationLevel.CLOSE_FRIEND;
          await engine.showText("You've become close friends with your neighbor!", "System");
        }
      }
    }
  }
};

export default knock_door;