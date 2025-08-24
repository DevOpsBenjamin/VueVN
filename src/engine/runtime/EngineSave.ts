import { PROJECT_ID } from '@/generate/components';
import type { EngineState, SaveData } from '@/generate/types'
import { EngineStateEnum } from '@/generate/enums'
import type { Engine } from '@/generate/runtime';

export const startNewGame = async (engine: Engine): Promise<void> => {
  engine.engineState.state = EngineStateEnum.LOADING;
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  // Access store action methods directly (properly typed)
  engine.gameState.resetGame();
  engine.engineState.resetState();
  
  engine.historyManager.resetHistory();
  engine.eventManager.resetEvents(engine.gameState);
  engine.navigationManager.rejectWaiters();
  engine.engineState.initialized = true;
  engine.engineState.state = EngineStateEnum.RUNNING;
};

export const loadGame = async (engine: Engine, slot: number): Promise<void> => {
  const raw = localStorage.getItem(`Save_${PROJECT_ID}_${slot}`);
  if (!raw) {
    throw new Error('No save found');
  }
  
  const data = JSON.parse(raw);
  // Restore game state using Pinia $state (properly typed)
  Object.assign(engine.gameState.$state, data.gameState);  
  engine.eventManager.resetEvents(engine.gameState);
  //LoadHistory
  engine.historyManager.loadHistoryData(data.historyState);
  // Restore engine state using Pinia $state (properly typed)
  Object.assign(engine.engineState.$state, data.engineState);

  engine.navigationManager.rejectWaiters();
  if (engine.engineState.currentEvent != null) {
    const event = engine.eventManager.findEventById(engine.engineState.currentEvent);
    if (event != null) {
      await engine.actionExecutor.runEvent(event);
    }
  }
};

export const saveGame = (engine: Engine, slot: number, name?: string): void => {
  // Create a clean copy of engineState using Pinia $state (properly typed)
  const engineStateCopy:EngineState = JSON.parse(JSON.stringify(engine.engineState.$state));
  engineStateCopy.state = EngineStateEnum.RUNNING;

  // Save history state separately
  const historyStateCopy = engine.historyManager.getHistoryData();
  
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
