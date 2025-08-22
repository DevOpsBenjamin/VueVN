import type { VNEvent } from '@/engine/runtime/types';

const timingEvent: VNEvent = {
  id: 'timing-event',
  name: 'Timing Challenge',
  conditions: (state) => state.location === 'bedroom',
  unlocked: (state) => state.flags.introSeen && state.flags.triedSleep,
  locked: (state) => state.flags.timingCompleted,
  
  async execute(engine, state) {
    await engine.showText("Suddenly, you hear your alarm clock acting strange...");
    await engine.showText("It's beeping in a weird pattern - almost like a code!");
    await engine.showText("Maybe if you can match the timing, something will happen?");
    
    // Le mini-jeu gère tout lui-même - pas de code après
    await engine.runCustomLogic('timingMinigame', { 
      difficulty: 2,
      context: 'alarm_clock' // Context pour que le mini-jeu sache quoi faire
    });
    
    // ❌ PLUS DE CODE ICI - le mini-jeu gère ses conséquences
    // L'événement se termine ici, le game loop redémarre après le mini-jeu
  }
};

export default timingEvent;