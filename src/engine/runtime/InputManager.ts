export default class InputManager {

}


  initVNInputHandlers(): void {
    window.addEventListener("keydown", (e) => {
      // Handle skip mode (Ctrl key)
      if (e.key === "Control") {
        this.skipMode = true;
        console.debug("Skip mode ON");
        return;
      }
      
      if (e.key === "Escape") {
        if (
          this.engineState.initialized &&
          this.engineState.state === ENGINE_STATES.MENU
        ) {
          this.engineState.state = ENGINE_STATES.RUNNING;
        } else {
          this.engineState.state = ENGINE_STATES.MENU;
        }
      } else if (e.key === "Space" || e.key === "ArrowRight") {
        // Forward navigation
        if (e.shiftKey && e.key === "ArrowRight") {
          this.resolveNavigation(); // History forward (redo)
        } else {
          this.resolveNavigation(); // Main forward navigation
        }
      } else if (e.key === "ArrowLeft") {
        this.goBack(); // History backward
      } else if (this.isForwardKey(e.key)) {
        // E key (works on both layouts) - forward
        this.resolveNavigation();
      } else if (this.isBackwardKey(e.key)) {
        // Q key (QWERTY) or A key (AZERTY) - backward
        this.goBack();
      } else if ((e.key === 'q' || e.key === 'Q') && !this.keyboardDetected) {
        // User pressed Q - they're likely on QWERTY, treat as backward
        this.keyboardLayout = 'qwerty';
        this.keyboardDetected = true;
        console.debug('Detected QWERTY layout (Q key pressed)');
        this.goBack();
      } else if ((e.key === 'a' || e.key === 'A') && !this.keyboardDetected) {
        // User pressed A - they might be on AZERTY trying to press Q, treat as backward
        this.keyboardLayout = 'azerty';
        this.keyboardDetected = true;
        console.debug('Detected AZERTY layout (A key pressed)');
        this.goBack();
      } else {
        console.debug(`Unhandled key: ${e.key}`);
      }
    });
    
    window.addEventListener("keyup", (e) => {
      // Handle skip mode release
      if (e.key === "Control") {
        this.skipMode = false;
        console.debug("Skip mode OFF");
      }
    });
    window.addEventListener("click", (e) => {
      if (e.clientX > window.innerWidth / 2) {
        if (this.engineState.state === ENGINE_STATES.RUNNING) {
          this.resolveNavigation(); // Main forward navigation
        } else {
          console.debug("Click ignored, not in RUNNING state");
        }
      } else {
        // Left side click - go back
        if (this.engineState.state === ENGINE_STATES.RUNNING) {
          this.goBack();
        }
      }
    });
  }

  private detectKeyboardLayout(): void {
    // Start with QWERTY as default (most common)
    this.keyboardLayout = 'qwerty';
    console.debug('Keyboard layout: Starting with QWERTY (will auto-detect on first Q/A key press)');
  }


  
  private isForwardKey(key: string): boolean {
    // E key works for both layouts
    return key === 'e' || key === 'E';
  }

  private isBackwardKey(key: string): boolean {
    // Only return true if layout is already detected
    if (!this.keyboardDetected) return false;
    
    // Q for QWERTY, A for AZERTY (since Q is where A is on AZERTY)
    if (this.keyboardLayout === 'azerty') {
      return key === 'a' || key === 'A';
    } else {
      return key === 'q' || key === 'Q';
    }
  }