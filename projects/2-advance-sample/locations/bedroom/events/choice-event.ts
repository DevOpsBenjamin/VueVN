import type { VNEvent } from '@/generate/types';
import { hallway, bedroom } from '@/generate/locations';

const choiceEvent: VNEvent = {
  id: 'choice-event',
  name: 'Important Decision',
  foreground: 'assets/images/background/bedroom/morning.png',
  conditions: (state) => state.location_id === bedroom.id,
  unlocked: (state) => state.flags.introSeen && (state.flags.exploredRoom || state.flags.checkedPhone),
  locked: (state) => state.flags.majorChoiceMade,
  
  async execute(engine, state) {
    await engine.showText('You find yourself in your cozy bedroom.');
    await engine.showText('Sunlight streams through the window.');
    await engine.showText("As you contemplate your next move... You hear a knock at your door.");
    await engine.showText("This could be the moment that changes everything.");
    
    const choice = await engine.showChoices([
      { text: 'Open the door immediately', branch: 'open_door' },
      { text: 'Ask who it is first', branch: 'ask_first' },
      { text: 'Pretend nobody is home', branch: 'pretend_away' }
    ]);
  },

  branches: {
    open_door: {
      async execute(engine, state) {
        state.flags.majorChoiceMade = true;
        state.player.personality = 'brave';
        state.location_id = hallway.id;
        await engine.showText("You boldly open the door without hesitation.");
        await engine.showText("Standing there is a mysterious figure in a dark coat...");
        await engine.showText("Your adventure truly begins now!");
      }
    },
    
    ask_first: {
      async execute(engine, state) {
        state.flags.majorChoiceMade = true;
        state.player.personality = 'cautious';
        state.location_id = hallway.id;
        await engine.showText("'Who is it?' you call out cautiously.");
        await engine.showText("'A friend,' comes the cryptic reply.");
        await engine.showText("You slowly open the door...");
      }
    },
    
    pretend_away: {
      async execute(engine, state) {
        state.flags.majorChoiceMade = true;
        state.player.personality = 'secretive';
        await engine.showText("You stay very quiet, hoping they'll go away.");
        await engine.showText("After a few minutes, you hear footsteps leaving.");
        await engine.showText("But you notice they slipped something under your door...");
        state.flags.mysteriousNote = true;
      }
    }
  }
};

export default choiceEvent;