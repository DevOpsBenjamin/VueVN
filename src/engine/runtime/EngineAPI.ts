import type Engine from "./Engine";

export const setBackground = (engine: Engine, imagePath: string): void => {
  console.debug("Setting background image:", imagePath);
  engine.engineState.background = imagePath;
};

export const setForeground = (engine: Engine, imagePath: string): void => {
  console.debug("Setting foreground image:", imagePath);
  engine.engineState.foreground = imagePath;
};

export const showText = async (
  engine: Engine,
  text: string,
  from = "engine",
): Promise<void> => {
  engine.engineState.currentStep++;
  if (engine.replayMode) {
    if (engine.engineState.currentStep < engine.targetStep) {
      return;
    }
    engine.replayMode = false;
  }

  engine.engineState.dialogue = {
    from,
    text,
  };
  return new Promise((resolve) => {
    engine.awaiterResult = resolve;
  });
};

export const showChoices = async (
  engine: Engine,
  choices: Array<{ text: string; id: string }>,
): Promise<string> => {
  engine.engineState.choices = choices;
  return new Promise((resolve) => {
    engine.awaiterResult = resolve;
  });
};

export default {
  setBackground,
  setForeground,
  showText,
  showChoices,
};
