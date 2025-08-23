import { PROJECT_ID } from '@/generate/components';
import type { EngineState } from '@/generate/types'
import { EngineStateEnum } from '@/generate/enums'
import type { Engine } from '@/generate/runtime';

export const startNewGame = async (engine: Engine): Promise<void> => {
  engine.cancelAwaiter();
  engine.engineState.state = EngineStateEnum.LOADING;
  await new Promise((resolve) => setTimeout(resolve, 100));
  engine.gameState.resetGame();
  //engine.engineState.resetState();
  engine.historyManager.resetHistory();
  engine.eventManager.resetEvents(engine.gameState);
  engine.engineState.initialized = true;
  engine.engineState.state = EngineStateEnum.RUNNING;
};

export const loadGame = async (engine: Engine, slot: string): Promise<void> => {
  engine.cancelAwaiter();
  const raw = localStorage.getItem(`Save_${PROJECT_ID}_${slot}`);
  if (!raw) {
    throw new Error('No save found');
  }
  
  const data = JSON.parse(raw);
  // Restore game state
  Object.assign(engine.gameState.$state, data.gameState);  
  engine.eventManager.resetEvents(engine.gameState);
  //LoadHistory
  engine.historyManager.load(data.historyState);
  // Restore engine state
  Object.assign(engine.engineState.state, data.engineState);
};

export const saveGame = (engine: Engine, slot: string, name?: string): void => {
  // Create a clean copy of engineState, filtering out non-serializable properties
  const engineStateCopy:EngineState = JSON.parse(JSON.stringify(engine.engineState.state));
  engineStateCopy.state = EngineStateEnum.RUNNING;

  // Save history state separately
  const historyStateCopy = {
    history: engine.historyManager.history,
    future: engine.historyManager.future
  };
  
  const data = {
    name: name || `Save ${slot}`,
    timestamp: new Date().toISOString(),
    gameState: JSON.parse(JSON.stringify(engine.gameState.$state)),
    engineState: engineStateCopy,
    historyState: historyStateCopy,
  };

  localStorage.setItem(`Save_${PROJECT_ID}_${slot}`, JSON.stringify(data));
};

export default {
  startNewGame,
  loadGame,
  saveGame,
};
