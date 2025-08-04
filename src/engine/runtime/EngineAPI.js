/** * Set the background image for the current scene
 * @param {string} imagePath - Path to the background image
 * */
const setBackground = (engine, imagePath) => {
  console.debug('Setting background image:', imagePath);
  engine.engineState.background = imagePath;
};

/** * Set the foreground image (e.g., character sprite)
 * @param {string} imagePath - Path to the foreground image
 * */
const setForeground = (engine, imagePath) => {
  console.debug('Setting foreground image:', imagePath);
  engine.engineState.foreground = imagePath;
};

/**
 * Show text and await user to continue (space/click/right), or menu (escape)
 * Stores resolver for menu integration
 */
const showText = async (engine, text, from = 'engine') => {
  engine.engineState.currentStep++;
  // If in replay mode, auto-resolve if we haven't reached the target step yet
  if (engine.replayMode && engine.engineState.currentStep < engine.targetStep) {
    return; // auto-resolve
  }

  // Set engine state for UI
  engine.engineState.dialogue = {
    from: from,
    text: text,
  };
  return new Promise((resolve) => {
    engine.awaiterResult = resolve;
  });
};

export default {
  setBackground,
  setForeground,
  showText,
};
