import type { VNEvent } from '@generate/types';
import { RelationLevel } from '@generate/enums';
import t from '@generate/texts';

const event_text = t.locations.neighbor_entrance;
const knock_door: VNEvent = {
  name: 'Knock on Neighbor Door',
  foreground: 'assets/images/background/neighbor/entrance.png',
  conditions: (state) => state.flags.knock_door === true && (state.gameTime.hour >= 9 && state.gameTime.hour <= 16),
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.knock_door = false; 
    await engine.showText({ text: event_text.knock_door.stand_at_door });
    await engine.showText({ text: event_text.knock_door.knock_sound });
    
    // Check relation level for different responses
    const relationStatus = state.neighbor.relationship;
    
    if (relationStatus === RelationLevel.STRANGER) {
      await engine.showText({ text: event_text.knock_door.stranger_door_slightly });
      await engine.showText({ text: event_text.knock_door.stranger_who_are_you, from: "Neighbor" });
    } else if (relationStatus === RelationLevel.ACQUAINTANCE) {
      await engine.showText({ text: event_text.knock_door.acquaintance_door_opens });
      await engine.showText({ text: event_text.knock_door.acquaintance_what_brings, from: state.neighbor.name });
    } else if (relationStatus === RelationLevel.FRIEND) {
      await engine.showText({ text: event_text.knock_door.friend_door_smile });
      await engine.showText({ text: event_text.knock_door.friend_nice_to_see, from: state.neighbor.name });
    } else if (relationStatus === RelationLevel.CLOSE_FRIEND) {
      await engine.showText({ text: event_text.knock_door.close_friend_door_warmly });
      await engine.showText({ text: event_text.knock_door.close_friend_come_in, from: state.neighbor.name });
    }
    await engine.showChoices([
      { text: event_text.knock_door.choice_say_hello, branch: 'chat' }
    ]);
  },

  branches: {
    chat: {
      async execute(engine, state) {
        const currentRelation = state.neighbor.relation;
        const relationStatus = state.neighbor.relationship;

        if (relationStatus === RelationLevel.STRANGER) {
          state.neighbor.relationship = RelationLevel.ACQUAINTANCE;
          await engine.showText({ 
            text: event_text.knock_door.introduce_self, 
            from: state.player.name,
            variables: { PLAYER_NAME: state.player.name }
          });
          await engine.showText({ 
            text: event_text.knock_door.neighbor_introduction, 
            from: state.neighbor.name,
            variables: { PLAYER_NAME: state.player.name, NEIGHBOR_NAME: state.neighbor.name }
          });
          await engine.showText({ text: event_text.knock_door.dinner_invitation, from: state.player.name });
          state.flags.dinner_invite = true;
          await engine.showText({ text: event_text.knock_door.neighbor_acceptance, from: state.neighbor.name });
        }
        else {
          state.neighbor.relation = Math.min(currentRelation + 1, 100);
          await engine.showText({ text: event_text.knock_door.pleasant_conversation });
          await engine.showText({ text: event_text.knock_door.warming_up, from: "System" });
        }

        // Update relationship status based on relation points
        if (state.neighbor.relation >= 30 && state.neighbor.relationship === RelationLevel.ACQUAINTANCE) {
          state.neighbor.relationship = RelationLevel.FRIEND;
          await engine.showText({ text: event_text.knock_door.friendship_forming, from: "System" });
        } else if (state.neighbor.relation >= 60 && state.neighbor.relationship === RelationLevel.FRIEND) {
          state.neighbor.relationship = RelationLevel.CLOSE_FRIEND;
          await engine.showText({ text: event_text.knock_door.close_friends_now, from: "System" });
        }
      }
    }
  }
};

export default knock_door;