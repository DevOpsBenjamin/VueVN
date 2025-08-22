import { PROJECT_ID } from '@/generate/components';
import { engineStateEnum as ENGINE_STATES } from '@/generate/stores';
import type { Engine } from '@/generate/runtime';

export const startNewGame = async (engine: Engine): Promise<void> => {
  engine.cancelAwaiter();
  engine.engineState.state = ENGINE_STATES.LOADING;
  await new Promise((resolve) => setTimeout(resolve, 100));
  engine.engineState.resetState();
  engine.gameState.resetGame();
  engine.createEventsCopy();
  engine.updateEvents();
  engine.engineState.initialized = true;
  engine.engineState.state = ENGINE_STATES.RUNNING;
};

export const loadGame = async (engine: Engine, slot: string): Promise<void> => {
  engine.cancelAwaiter();
  const raw = localStorage.getItem(`Save_${PROJECT_ID}_${slot}`);
  if (!raw) {
    throw new Error('No save found');
  }
  
  const data = JSON.parse(raw);
  const saveVersion = data.saveVersion || 1;
  
  console.debug(`Loading game from slot ${slot}, save version ${saveVersion}`);
  
  engine.engineState.resetState();
  engine.gameState.resetGame();
  
  // Restore game state
  Object.assign(engine.gameState.$state, data.gameState);
  
  // Restore engine state
  Object.assign(engine.engineState.$state, data.engineState);
  
  // For version 2+ saves, restore additional properties that might not be in $state
  if (saveVersion >= 2) {
    if (typeof data.engineState.currentActionIndex !== 'undefined') {
      engine.engineState.currentActionIndex = data.engineState.currentActionIndex;
    }
    
    if (data.engineState.history && Array.isArray(data.engineState.history)) {
      engine.engineState.history = data.engineState.history;
    }
  }
  
  engine.createEventsCopy();
  engine.updateEvents();
  engine.engineState.initialized = true;
  
  console.debug(`Restored game state, currentActionIndex: ${engine.engineState.currentActionIndex}`);
  
  await startEventReplay(engine);
  engine.engineState.state = ENGINE_STATES.RUNNING;
};

const startEventReplay = async (engine: Engine): Promise<void> => {
  if (!engine.engineState.currentEvent || engine.engineState.currentActionIndex === 0) {
    console.warn('No current event to replay or already at start');
    return;
  }
  
  const event = engine.findEventById(engine.engineState.currentEvent);
  if (!event) {
    console.warn('Event not found for replay:', engine.engineState.currentEvent);
    return;
  }

  console.debug(`Starting event replay for: ${event.id}, jumping to action ${engine.engineState.currentActionIndex}`);
  
  // Simulate the event to get the action sequence
  const actionSequence = await engine.simulateEvent(event);
  
  // Fast-forward through actions up to the saved position
  engine.engineState.isFastForwarding = true;
  
  try {
    for (let i = 0; i < engine.engineState.currentActionIndex && i < actionSequence.length; i++) {
      const action = actionSequence[i];
      
      // Execute action without user interaction for fast-forward
      switch (action.type) {
        case 'showText':
          engine.engineState.dialogue = { from: action.from || '', text: action.text };
          break;
        case 'setBackground':
          engine.engineState.background = action.imagePath;
          break;
        case 'setForeground':
          engine.engineState.foreground = action.imagePath;
          break;
        case 'showChoices':
          // For choices during replay, use the cached result if available
          engine.engineState.choices = action.choices;
          if (action.cachedResult) {
            // Skip to the choice that was made
            engine.engineState.choices = null;
          }
          break;
        case 'runCustomLogic':
          // For custom logic during replay, use cached result if available
          if (action.cachedResult) {
            if (action.logicId === 'minigame') {
              engine.engineState.minigame = null; // Clear any previous minigame
            }
          } else {
            // If no cached result, we may need to re-run or prompt user
            engine.engineState.minigame = {
              active: true,
              type: action.logicId,
              props: action.args
            };
          }
          break;
      }
      
      // Update current action index
      engine.engineState.currentActionIndex = i + 1;
    }
  } finally {
    engine.engineState.isFastForwarding = false;
  }
  
  console.debug(`Event replay completed, positioned at action ${engine.engineState.currentActionIndex}`);
};

export const saveGame = (engine: Engine, slot: string, name?: string): void => {
  console.log(`ENGINESAVE CALL: Saving game to slot ${slot}`);
  
  // Create a clean copy of engineState, filtering out non-serializable properties
  const engineStateCopy = JSON.parse(JSON.stringify(engine.engineState.$state));
  
  // Ensure currentActionIndex is included for replay functionality
  if (typeof engine.engineState.currentActionIndex !== 'undefined') {
    engineStateCopy.currentActionIndex = engine.engineState.currentActionIndex;
  }
  
  // Include history for potential advanced replay features, but limit size
  if (engine.engineState.history && engine.engineState.history.length > 0) {
    // Only save the last 10 history entries to keep save file manageable
    engineStateCopy.history = engine.engineState.history.slice(-10);
  }
  
  const data = {
    name: name || `Save ${slot}`,
    timestamp: new Date().toISOString(),
    gameState: JSON.parse(JSON.stringify(engine.gameState.$state)),
    engineState: engineStateCopy,
    // Save format version for future compatibility
    saveVersion: 2
  };

  localStorage.setItem(`Save_${PROJECT_ID}_${slot}`, JSON.stringify(data));
  console.debug(`Game saved to slot ${slot} with action index ${engine.engineState.currentActionIndex}`);
};

export default {
  startNewGame,
  loadGame,
  saveGame,
};
