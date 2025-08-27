import type { VNEvent } from '@generate/types';
import { RelationLevel } from '@generate/enums';
import { text, interpolate } from '@generate/textProvider';

const knock_door: VNEvent = {
  name: 'Knock on Neighbor Door',
  foreground: 'assets/images/background/neighbor/entrance.png',
  conditions: (state) => state.flags.knock_door === true && (state.gameTime.hour >= 9 && state.gameTime.hour <= 16),
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.flags.knock_door = false; 
    await engine.showText(text.locations.neighbor_entrance.knock_door.stand_at_door);
    await engine.showText(text.locations.neighbor_entrance.knock_door.knock_sound);
    
    // Check relation level for different responses
    const relationStatus = state.neighbor.relationship;
    
    if (relationStatus === RelationLevel.STRANGER) {
      await engine.showText(text.locations.neighbor_entrance.knock_door.stranger_door_slightly);
      await engine.showText(text.locations.neighbor_entrance.knock_door.stranger_who_are_you, "Neighbor");
    } else if (relationStatus === RelationLevel.ACQUAINTANCE) {
      await engine.showText(text.locations.neighbor_entrance.knock_door.acquaintance_door_opens);
      await engine.showText(text.locations.neighbor_entrance.knock_door.acquaintance_what_brings, `${state.neighbor.name}`);
    } else if (relationStatus === RelationLevel.FRIEND) {
      await engine.showText(text.locations.neighbor_entrance.knock_door.friend_door_smile);
      await engine.showText(text.locations.neighbor_entrance.knock_door.friend_nice_to_see, `${state.neighbor.name}`);
    } else if (relationStatus === RelationLevel.CLOSE_FRIEND) {
      await engine.showText(text.locations.neighbor_entrance.knock_door.close_friend_door_warmly);
      await engine.showText(text.locations.neighbor_entrance.knock_door.close_friend_come_in, `${state.neighbor.name}`);
    }
    await engine.showChoices([
      { text: text.locations.neighbor_entrance.knock_door.choice_say_hello, branch: 'chat' }
    ]);
  },

  branches: {
    chat: {
      async execute(engine, state) {
        const currentRelation = state.neighbor.relation;
        const relationStatus = state.neighbor.relationship;

        if (relationStatus === RelationLevel.STRANGER) {
          state.neighbor.relationship = RelationLevel.ACQUAINTANCE;
          await engine.showText(interpolate(text.locations.neighbor_entrance.knock_door.introduce_self, { PLAYER_NAME: state.player.name }), `${state.player.name}`);
          await engine.showText(interpolate(text.locations.neighbor_entrance.knock_door.neighbor_introduction, { PLAYER_NAME: state.player.name, NEIGHBOR_NAME: state.neighbor.name }), `${state.neighbor.name}`);
          await engine.showText(text.locations.neighbor_entrance.knock_door.dinner_invitation, `${state.player.name}`);
          state.flags.dinner_invite = true;
          await engine.showText(text.locations.neighbor_entrance.knock_door.neighbor_acceptance, `${state.neighbor.name}`);
        }
        else {
          state.neighbor.relation = Math.min(currentRelation + 1, 100);
          await engine.showText(text.locations.neighbor_entrance.knock_door.pleasant_conversation);
          await engine.showText(text.locations.neighbor_entrance.knock_door.warming_up, "System");
        }

        // Update relationship status based on relation points
        if (state.neighbor.relation >= 30 && state.neighbor.relationship === RelationLevel.ACQUAINTANCE) {
          state.neighbor.relationship = RelationLevel.FRIEND;
          await engine.showText(text.locations.neighbor_entrance.knock_door.friendship_forming, "System");
        } else if (state.neighbor.relation >= 60 && state.neighbor.relationship === RelationLevel.FRIEND) {
          state.neighbor.relationship = RelationLevel.CLOSE_FRIEND;
          await engine.showText(text.locations.neighbor_entrance.knock_door.close_friends_now, "System");
        }
      }
    }
  }
};

export default knock_door;