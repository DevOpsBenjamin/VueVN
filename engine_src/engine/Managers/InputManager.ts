import { EngineStateEnum } from '@generate/enums';
import type { EngineState, GameState } from '@generate/types';
import { NavigationManager } from '@generate/engine';

type KeyboardLayout = 'qwerty' | 'azerty' | 'unknown';

export default class InputManager {
  private skipMode = false;
  private keyboardLayout: KeyboardLayout = 'unknown';
  private engineState: EngineState;
  private gameState: GameState;
  private gameRoot: HTMLElement;
  private navigationManager: NavigationManager;

  // keep references so we can remove listeners later
  private readonly keyDownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
  private readonly keyUpHandler = (e: KeyboardEvent) => this.handleKeyUp(e);
  private readonly clickHandler = (e: MouseEvent) => this.handleClick(e);
  
  constructor(
    engineState: EngineState,
    gameState: GameState,
    navigationManager: NavigationManager,
    gameRoot: HTMLElement
  ) {
    this.engineState = engineState;
    this.gameState = gameState;
    this.navigationManager = navigationManager;
    this.gameRoot = gameRoot;
  }

  /** Attach listeners */
  init(): void {
    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
    this.gameRoot.addEventListener('click', this.clickHandler);
  }

  /** Detach listeners (call on teardown) */
  destroy(): void {
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
    this.gameRoot.removeEventListener('click', this.clickHandler);
  }

  // -------------------------
  // Event handlers
  // -------------------------
  private handleKeyDown(e: KeyboardEvent): void {
    // Skip mode (hold Control)
    if (e.key === 'Control') {
      this.navigationManager.enableSkipMode();
      return;
    }

    if (e.key == 'Escape') {
      this.toggleMenu();
      return;
    }

    if (this.isForwardKey(e)) {
      this.forward();
      return;
    }
    if (this.isBackwardKey(e)) {
      this.backward();
      return;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (e.key === 'Control') {
      this.navigationManager.disableSkipMode();
    }
  }

  private handleClick(e: MouseEvent): void {
    // Only react to clicks while running
    if (this.engineState.state !== EngineStateEnum.RUNNING) {
      console.debug('Click ignored, not in RUNNING state');
      return;
    }

    const rect = this.gameRoot.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;

    if (e.clientX > midpoint) {
      this.forward();
    } else {
      this.backward();
    }
  }

  // -------------------------
  // Helpers (navigation)
  // -------------------------
  private async backward(): Promise<void> {
    await this.navigationManager.goBack();
  }

  private forward(): void {
    this.navigationManager.goForward();
  }

  private toggleMenu(): void {
    if (this.engineState.initialized && this.engineState.state === EngineStateEnum.MENU) {
      this.engineState.state = EngineStateEnum.RUNNING;
    } else {
      this.engineState.state = EngineStateEnum.MENU;
    }
  }

  // -------------------------
  // Helpers (keyboard intent)
  // -------------------------
  /** Keys that always mean "forward" (independent of layout) */
  private isForwardKey(e: KeyboardEvent): boolean {
    // E works well on both QWERTY/AZERTY
    return e.key === 'e' 
        || e.key === 'E' 
        || e.key == 'Space'
        || e.key == 'ArrowRight';
  }
  
  /**
   * Centralizes *all* logic for backward intent + first-hit layout detection.
   * Returns true if the current key should be treated as "backward".
   */
  private isBackwardKey(e: KeyboardEvent): boolean {
    const key = e.key;
    if (key == 'ArrowLeft') {
      return true;
    }
    
    // Layout already known
    if (this.keyboardLayout === 'azerty') {
      return key === 'a' || key === 'A';
    }
    if (this.keyboardLayout === 'qwerty') {
      // QWERTY
      return key === 'q' || key === 'Q';
    }

    // If we haven't detected layout yet, detect on first Q/A press.
    if (this.keyboardLayout === 'unknown') {
      if (key === 'q' || key === 'Q') {
        this.keyboardLayout = 'qwerty';
        return true; // treat as backward immediately
      }
      if (key === 'a' || key === 'A') {
        this.keyboardLayout = 'azerty';
        return true; // treat as backward immediately
      }
    }
    return false;
  }
}