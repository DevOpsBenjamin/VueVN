import { neighbor_entrance } from '@/generate/locations';
import type { VNEvent } from '@/generate/types';

const knockDoorMain: VNEvent = {
  id: 'knock-door-main',
  name: 'Knock on Door - Router',
  foreground: 'assets/images/background/neighbor/entrance.png',
  conditions: (state) => {
    const atNeighbor = state.location_id === neighbor_entrance.id;
    const wantsToKnock = state.flags.knock_door === true;
    
    return atNeighbor && wantsToKnock;
  },
  unlocked: (state) => true,
  locked: (state) => false,
  
  async execute(engine, state) {
    // Reset the knock flag immediately
    state.flags.knock_door = false;
    
    // Add door frame on top of base background
    engine.addForeground('assets/images/objects/door_frame.png');
    
    await engine.showText("You approach your neighbor's door...");
    await engine.showText("*knock knock*");
    
    // Router logic - jump based on conditions (most specific first)
    const relation = state.neighbor.relation;
    const relationStatus = state.neighbor.relationshipStatus;
    const hour = state.gameTime.hour;
    const lust = state.player.lust;
    
    if (relationStatus === 'close_friend' && (hour > 22 || hour < 6)) {
      await engine.jump('knock-door-lover-late');
    } else if (relationStatus === 'close_friend' && lust > 60) {
      await engine.jump('knock-door-lover-lust');
    } else if (relationStatus === 'close_friend') {
      await engine.jump('knock-door-lover');
    } else if (relation > 50 && (hour > 20 || hour < 8)) {
      await engine.jump('knock-door-friend-late');
    } else if (relation > 50) {
      await engine.jump('knock-door-friend');
    } else if (relation > 20) {
      await engine.jump('knock-door-acquaintance');
    } else if (hour > 18 || hour < 9) {
      await engine.jump('knock-door-stranger-late');
    } else {
      await engine.jump('knock-door-stranger');
    }
  }
};

export default knockDoorMain;