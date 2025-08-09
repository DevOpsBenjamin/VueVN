import { PROJECT_ID } from "@/generate/components";
import { engineStateEnum as ENGINE_STATES } from "@/generate/stores";
import type Engine from "./Engine";

export const startNewGame = (engine: Engine): void => {
  engine.cancelAwaiter();
  engine.engineState.state = ENGINE_STATES.LOADING;
  engine.engineState.resetState();
  engine.gameState.resetGame();
  engine.createEventsCopy();
  engine.updateEvents();
  engine.engineState.initialized = true;
  engine.engineState.state = "RUNNING";
};

export const loadGame = async (engine: Engine, slot: string): Promise<void> => {
  engine.cancelAwaiter();
  const raw = localStorage.getItem(`Save_${PROJECT_ID}_${slot}`);
  if (!raw) {
    throw new Error("No save found");
  }
  const data = JSON.parse(raw);
  engine.engineState.resetState();
  engine.gameState.resetGame();
  Object.assign(engine.gameState, data.gameState);
  Object.assign(engine.engineState, data.engineState);
  engine.createEventsCopy();
  engine.updateEvents();
  engine.engineState.initialized = true;
  await startEventReplay(engine);
  engine.engineState.state = ENGINE_STATES.RUNNING;
};

const startEventReplay = async (engine: Engine): Promise<void> => {
  if (!engine.engineState.currentEvent) {
    console.warn("No current event to replay");
    return;
  }
  engine.replayMode = true;
  engine.targetStep = engine.engineState.currentStep;
  engine.engineState.currentStep = 0;
  const event = engine.findEventById(engine.engineState.currentEvent);
  if (event) {
    console.debug("Starting event replay for:", event.id);
    await engine.handleEvent(event);
  }
  engine.engineState.state = ENGINE_STATES.RUNNING;
};

export const saveGame = (engine: Engine, slot: string, name?: string): void => {
  console.log(`ENGINESAVE CALL: Saving game to slot ${slot}`);
  const data = {
    name: name || `Save ${slot}`,
    timestamp: new Date().toISOString(),
    screenshot: engine.lastScreenshot,
    gameState: JSON.parse(JSON.stringify(engine.gameState.$state)),
    engineState: JSON.parse(JSON.stringify(engine.engineState.$state)),
  };

  localStorage.setItem(`Save_${PROJECT_ID}_${slot}`, JSON.stringify(data));
};

export default {
  startNewGame,
  loadGame,
  saveGame,
};
