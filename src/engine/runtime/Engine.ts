import {
  EngineEvents,
  EngineAPI,
  EngineSave,
  VNInterruptError,
} from "@/generate/runtime";
import html2canvas from "html2canvas";
import { engineStateEnum as ENGINE_STATES } from "@/generate/stores";
import type { GameState, EngineState, VNEvent } from "./types";

class Engine {
  gameState: GameState;
  engineState: EngineState;
  awaiterResult: ((value: any) => void) | null;
  lastScreenshot: string | null;
  replayMode: boolean;
  targetStep: number;
  eventCache: Record<
    string,
    { notReady: VNEvent[]; unlocked: VNEvent[]; locked: VNEvent[] }
  >;

  constructor(gameState: GameState, engineState: EngineState) {
    this.gameState = gameState;
    this.engineState = engineState;
    this.awaiterResult = null;
    this.lastScreenshot = null;
    this.replayMode = false;
    this.targetStep = 0;
    this.eventCache = {};

    if (typeof window !== "undefined") {
      const w = window as any;
      if (!w.__VN_ENGINE__) {
        console.debug("Initializing VN Engine instance");
        w.VueVN = this.gameState;
        w.__VN_ENGINE__ = this;
        this.initVNInputHandlers();
      }
    }
  }

  static getInstance(): Engine | undefined {
    return typeof window !== "undefined"
      ? ((window as any).__VN_ENGINE__ as Engine)
      : undefined;
  }

  // #region Engine API for events and UI
  setBackground(imagePath: string): void {
    EngineAPI.setBackground(this, imagePath);
  }

  setForeground(imagePath: string): void {
    EngineAPI.setForeground(this, imagePath);
  }

  async showText(text: string, from = "engine"): Promise<void> {
    await EngineAPI.showText(this, text, from);
  }

  async showChoices(
    choices: Array<{ text: string; id: string }>,
  ): Promise<string> {
    return await EngineAPI.showChoices(this, choices);
  }
  // #endregion

  // #region SAVE engine
  startNewGame(): void {
    EngineSave.startNewGame(this);
  }

  loadGame(slot: string): Promise<void> {
    return EngineSave.loadGame(this, slot);
  }

  saveGame(slot: string, name?: string): void {
    console.log(`ENGINE CALL: Saving game to slot ${slot}`);
    EngineSave.saveGame(this, slot, name);
  }
  // #endregion

  async captureGameScreenshot(): Promise<string | null> {
    const gameEl = document.getElementById("game-root");
    if (!gameEl) return null;
    const canvas = await html2canvas(gameEl);
    return canvas.toDataURL("image/png");
  }

  initVNInputHandlers(): void {
    window.addEventListener("keydown", async (e) => {
      if (e.key === "Escape") {
        if (
          this.engineState.initialized &&
          this.engineState.state === ENGINE_STATES.MENU
        ) {
          this.engineState.state = ENGINE_STATES.RUNNING;
        } else {
          this.lastScreenshot = await this.captureGameScreenshot();
          this.engineState.state = ENGINE_STATES.MENU;
        }
      } else if (e.key === "Space" || e.key === "ArrowRight") {
        this.resolveAwaiter("continue");
      } else {
        console.debug(`Unhandled key: ${e.key}`);
      }
    });
    window.addEventListener("click", (e) => {
      if (e.clientX > window.innerWidth / 2) {
        if (this.engineState.state === ENGINE_STATES.RUNNING) {
          this.resolveAwaiter("continue");
        } else {
          console.debug("Click ignored, not in RUNNING state");
        }
      } else {
        // Optionally: this.resolveAwaiter('back');
      }
    });
  }

  resolveAwaiter(result: any): void {
    if (this.awaiterResult) {
      console.debug("Resolving awaiter with result:", result);
      this.awaiterResult(result);
      this.cleanAwaiter();
    } else {
      console.debug("No awaiter to resolve");
    }
  }

  cancelAwaiter(): void {
    if (this.awaiterResult) {
      console.debug("Cancelling awaiter");
      this.awaiterResult(Promise.reject(new VNInterruptError()));
      this.cleanAwaiter();
    } else {
      console.debug("No awaiter to cancel");
    }
  }

  cleanAwaiter(): void {
    this.awaiterResult = null;
    this.engineState.dialogue = null;
    (this.engineState as any).choices = null;
  }

  async run(): Promise<void> {
    console.log("Starting Engine...");
    while (true) {
      try {
        await this.runGameLoop();
      } catch (err) {
        if (err instanceof VNInterruptError) {
          console.warn("VN event interrupted, returning to menu or resetting.");
        } else {
          console.error("Engine error:", err);
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      }
      while (this.engineState.state !== "RUNNING") {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  async runGameLoop(): Promise<void> {
    console.log("Starting Game engine...", this.engineState.state);
    while (this.engineState.state === "RUNNING") {
      const { immediateEvent, drawableEvents } = await this.getEvents();
      console.debug(
        `getEvents returned: immediateEvent=${immediateEvent ? immediateEvent.id : "none"}, drawableEvents=${drawableEvents.length}`,
      );
      if (immediateEvent) {
        this.engineState.currentEvent = immediateEvent.id;
        this.engineState.currentStep = 0;
        await this.handleEvent(immediateEvent);
      } else {
        // placeholder for drawable events
      }
      console.log("Petit sleep pour debug l'engine...");
      await new Promise((resolve) => setTimeout(resolve, 20000));
    }
  }

  findEventById(eventId: string): VNEvent | null {
    return null;
  }

  async handleEvent(immediateEvent: VNEvent): Promise<void> {
    await EngineEvents.handleEvent(this, immediateEvent);
  }

  createEventsCopy(): void {
    EngineEvents.createEventsCopy(this);
  }

  async getEvents(): Promise<{
    immediateEvent: VNEvent | null;
    drawableEvents: VNEvent[];
  }> {
    return await EngineEvents.getEvents(this);
  }

  updateEvents(location?: string): void {
    EngineEvents.updateEvents(this, location);
  }
}

export default Engine;
