# Proposed Engine Architecture: Mixed Approach for VueVN

This document details a revised engine architecture for VueVN, combining the benefits of atomic action logging for robust history and replay with the flexibility of user-defined TypeScript logic within events. This "mixed" approach aims to provide a powerful yet intuitive development experience.

## Core Principles

1.  **Atomic Actions (`VNAction`):** These remain the fundamental, granular units of game progression (e.g., showing text, changing background). They are crucial for building a precise history log.
2.  **Game History Log (`GameHistoryEntry`):** The engine maintains a comprehensive, ordered log of every `VNAction` executed, along with a snapshot of the `gameState` and `engineState` *before* that action. This log is the bedrock for "go back" and "go forward" functionality.
3.  **State Snapshotting:** Before each `VNAction` is processed by the core engine, a deep copy of the current `gameState` and `engineState` is taken and stored in the `history` log. This ensures that any modifications made by the user's TypeScript code (e.g., to `gameState.flags`) are accurately captured *before* the next atomic action is applied.
4.  **User-Defined `execute` Method:** Each `VNEvent` will have an `async execute(engine, gameState)` method. This is where the game developer writes their custom TypeScript logic, including conditional branching, direct `gameState` manipulation, and calls to the engine's API.
5.  **Engine API as Action Emitter:** The `engine` object passed into the `execute` method will expose a set of high-level methods (e.g., `showText`, `showChoices`, `jump`). When these methods are called by the user, they do *not* directly modify the engine's visual state. Instead, they internally create the corresponding `VNAction` and "emit" it to the core engine for processing. The `execute` method then `await`s this processing.

## Key Components and Changes

### 1. `src/engine/runtime/types.ts` (Updated)

This file defines the core data structures, including the `VNAction` types, the `GameHistoryEntry` for logging, the `VNEvent` structure with its `execute` method, and the `EngineAPIForEvents` interface that defines what's available to event developers.

```typescript
// src/engine/runtime/types.ts

export type Dialogue = {
  from: string;
  text: string;
};

export type Choice = {
  text: string;
  id: string;
};

/**
 * Defines the atomic actions that can be part of a visual novel event.
 * These are the fundamental operations logged in history.
 */
export type VNAction =
  | { type: 'showText'; text: string; from?: string }
  | { type: 'setBackground'; imagePath: string }
  | { type: 'setForeground'; imagePath: string }
  | { type: 'showChoices'; choices: Array<Choice> }
  | { type: 'jump'; eventId: string }; // Jumps to another event by ID

/**
 * Represents a single entry in the game's history log.
 * Stores the action performed and the state of the game *before* that action.
 */
export type GameHistoryEntry = {
  action: VNAction;
  gameStateBefore: GameState;   // Snapshot of game state before this action
  engineStateBefore: EngineState; // Snapshot of engine state before this action
  choiceMade?: string;          // Optional: If the action was a choice, records the chosen ID
};

/**
 * Interface defining the methods available to event developers within the `execute` function.
 * These methods emit VNActions to the core engine.
 */
export interface EngineAPIForEvents {
  showText: (text: string, from?: string) => Promise<void>;
  setBackground: (imagePath: string) => Promise<void>; // Now async to await engine processing
  setForeground: (imagePath: string) => Promise<void>; // Now async
  showChoices: (choices: Array<Choice>) => Promise<string>;
  jump: (eventId: string) => Promise<void>; // Now async, and will cause an interrupt
}

/**
 * Represents a Visual Novel event.
 * Events now contain an `execute` method for custom TypeScript logic.
 */
export interface VNEvent {
  id: string;
  name: string;
  conditions?: (gameState: GameState) => boolean; // Conditions for the event to be available
  execute: (engine: EngineAPIForEvents, gameState: GameState) => Promise<void>;
}

// Existing GameState and EngineState interfaces, with additions for history.
export interface GameState {
  player: { name: string };
  location: string;
  flags: Record<string, any>;
  [key: string]: any;
}

export interface EngineState {
  background: string | null;
  foreground: string | null;
  dialogue: Dialogue | null;
  initialized: boolean;
  state: string; // e.g., "RUNNING", "MENU", "LOADING"
  currentEvent: string | null; // ID of the currently executing event
  currentActionIndex: number; // Index of the current action within the current event's actions array (for internal engine use)
  choices: Array<Choice> | null;
  history: GameHistoryEntry[]; // The main history log for "go back"
  future: GameHistoryEntry[]; // A temporary stack for "go forward" (when "go back" is used)
}
```

### 2. `src/engine/runtime/NewEngine.ts` (New Core Engine)

This will be the central orchestrator, managing the game loop, processing actions, and maintaining the history.

```typescript
// src/engine/runtime/NewEngine.ts

import {
  EngineEvents, // Still used for event discovery/management
  VNInterruptError,
} from "@/generate/runtime";
import { engineStateEnum as ENGINE_STATES } from "@/generate/stores";
import type { GameState, EngineState, VNEvent, VNAction, GameHistoryEntry, EngineAPIForEvents } from "./types";

class Engine {
  gameState: GameState;
  engineState: EngineState;
  private awaiterResult: ((value: any) => void) | null;
  private engineAPIForEvents: EngineAPIForEvents; // Instance of the API exposed to events

  constructor(gameState: GameState, engineState: EngineState) {
    this.gameState = gameState;
    this.engineState = engineState;
    this.awaiterResult = null;

    // Initialize history and future stacks if they don't exist
    if (!this.engineState.history) {
      this.engineState.history = [];
    }
    if (!this.engineState.future) {
      this.engineState.future = [];
    }

    // Initialize the EngineAPIForEvents instance
    this.engineAPIForEvents = {
      showText: (text, from) => this.processActionAndAwaitUser({ type: 'showText', text, from }),
      setBackground: (imagePath) => this.processActionAndAwaitUser({ type: 'setBackground', imagePath }),
      setForeground: (imagePath) => this.processActionAndAwaitUser({ type: 'setForeground', imagePath }),
      showChoices: (choices) => this.processActionAndAwaitUser({ type: 'showChoices', choices }),
      jump: (eventId) => this.processActionAndAwaitUser({ type: 'jump', eventId }),
    };

    if (typeof window !== "undefined") {
      const w = window as any;
      if (!w.__VN_ENGINE__) {
        console.debug("Initializing VN Engine instance");
        w.VueVN = this.gameState; // Expose gameState for debugging/external access
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

  /**
   * Initializes global input handlers for the VN engine (e.g., Escape for menu, Space/ArrowRight to continue).
   */
  initVNInputHandlers(): void {
    window.addEventListener("keydown", (e) => {
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
        this.resolveAwaiter("continue");
      } else if (e.key === "ArrowLeft") { // New: Go back
        this.goBack();
      } else if (e.key === "ArrowRight" && e.shiftKey) { // New: Go forward (Shift + Right Arrow)
        this.goForward();
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
        // Optionally: this.goBack(); // Click on left half to go back
      }
    });
  }

  /**
   * Resolves the current awaiter, allowing the engine to proceed.
   * @param result The result to pass to the awaiting promise.
   */
  resolveAwaiter(result: any): void {
    if (this.awaiterResult) {
      console.debug("Resolving awaiter with result:", result);
      this.awaiterResult(result);
      this.cleanAwaiter();
    } else {
      console.debug("No awaiter to resolve");
    }
  }

  /**
   * Cancels the current awaiter, typically used when interrupting an event (e.g., going to menu).
   */
  cancelAwaiter(): void {
    if (this.awaiterResult) {
      console.debug("Cancelling awaiter");
      this.awaiterResult(Promise.reject(new VNInterruptError()));
      this.cleanAwaiter();
    } else {
      console.debug("No awaiter to cancel");
    }
  }

  /**
   * Cleans up the awaiter state after it has been resolved or cancelled.
   */
  cleanAwaiter(): void {
    this.awaiterResult = null;
    this.engineState.dialogue = null;
    (this.engineState as any).choices = null;
  }

  /**
   * The main game loop. Continuously runs events when in the RUNNING state.
   */
  async run(): Promise<void> {
    console.log("Starting Engine...");
    while (true) {
      try {
        await this.runGameLoop();
      } catch (err) {
        if (err instanceof VNInterruptError) {
          console.warn("VN event interrupted, returning to menu or resetting.");
          // If a jump occurred, the loop will naturally pick up the new currentEvent
        } else {
          console.error("Engine error:", err);
          // Prevent rapid error looping, wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      }
      // Pause the engine loop if not in RUNNING state
      while (this.engineState.state !== "RUNNING") {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Executes the game logic within the RUNNING state.
   * Discovers and processes events.
   */
  async runGameLoop(): Promise<void> {
    console.log("Starting Game engine...", this.engineState.state);
    while (this.engineState.state === "RUNNING") {
      let currentEvent: VNEvent | null = null;

      // If we are resuming an event (e.g., after load or goBack/goForward)
      if (this.engineState.currentEvent) {
        currentEvent = this.findEventById(this.engineState.currentEvent);
        if (!currentEvent) {
          console.error(`Resuming event '${this.engineState.currentEvent}' not found. Resetting.`);
          this.engineState.currentEvent = null;
          this.engineState.currentActionIndex = 0;
          continue; // Try to find a new event
        }
      } else {
        // Find a new immediate event if no current event is set
        const { immediateEvent } = await EngineEvents.getEvents(this);
        if (immediateEvent) {
          currentEvent = immediateEvent;
          this.engineState.currentEvent = currentEvent.id;
          this.engineState.currentActionIndex = 0; // Always start from 0 for a new event
        }
      }

      if (currentEvent) {
        await this.processEvent(currentEvent);
      } else {
        // No immediate event found, perhaps wait for user interaction or a drawable event
        console.log("No immediate event found. Engine is idle.");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Small pause to prevent tight loop
      }
    }
  }

  /**
   * Processes a VNEvent by executing its `execute` method.
   * This method is responsible for handling the flow of actions emitted by the event.
   * @param event The VNEvent to process.
   */
  async processEvent(event: VNEvent): Promise<void> {
    console.debug(`Executing event: ${event.id}`);
    try {
      // Execute the user-defined event logic
      await event.execute(this.engineAPIForEvents, this.gameState);
      // If execute completes, the event is finished
      this.engineState.currentEvent = null;
      this.engineState.currentActionIndex = 0;
      console.debug(`Event ${event.id} finished.`);
    } catch (err) {
      if (err instanceof VNInterruptError) {
        console.warn(`Event ${event.id} interrupted.`);
        // If it's a jump, the currentEvent and currentActionIndex are already set by processActionAndAwaitUser
        // If it's a menu interrupt, the engine state will change and the loop will pause.
      } else {
        console.error(`Error during event ${event.id} execution:`, err);
        // Handle unexpected errors, potentially move to an error state or skip event
      }
    }
  }

  /**
   * Internal method called by EngineAPIForEvents methods.
   * It records the state, applies the action, and awaits user input if necessary.
   * @param action The VNAction to process.
   * @returns A promise that resolves when the action is complete and user input (if any) is received.
   */
  private async processActionAndAwaitUser(action: VNAction): Promise<any> {
    // Record the state *before* executing this action
    this.recordHistory(action);

    // Apply the action to the engine's state
    let result: any;
    switch (action.type) {
      case 'showText':
        this.engineState.dialogue = { from: action.from || "engine", text: action.text };
        result = await new Promise((resolve) => { this.awaiterResult = resolve; });
        break;
      case 'setBackground':
        this.engineState.background = action.imagePath;
        break;
      case 'setForeground':
        this.engineState.foreground = action.imagePath;
        break;
      case 'showChoices':
        this.engineState.choices = action.choices;
        result = await new Promise<string>((resolve) => { this.awaiterResult = resolve; });
        // After choice, record it in the last history entry
        if (this.engineState.history.length > 0) {
          this.engineState.history[this.engineState.history.length - 1].choiceMade = result;
        }
        break;
      case 'jump':
        const nextEvent = this.findEventById(action.eventId);
        if (nextEvent) {
          this.engineState.currentEvent = nextEvent.id;
          this.engineState.currentActionIndex = 0; // Reset action index for the new event
          throw new VNInterruptError("Jump to new event"); // Interrupt current event execution
        } else {
          console.error(`Event with id '${action.eventId}' not found for jump action.`);
        }
        break;
      default:
        console.warn(`Unknown action type: ${(action as any).type}`);
    }
    return result;
  }

  /**
   * Records the current state and the action about to be executed into the history log.
   * @param action The action that is about to be executed.
   */
  recordHistory(action: VNAction): void {
    // Clear 'future' stack when a new action is recorded (prevents "time paradoxes")
    this.engineState.future = [];

    // Deep copy of state before the action
    const gameStateBefore = JSON.parse(JSON.stringify(this.gameState.$state));
    const engineStateBefore = JSON.parse(JSON.stringify(this.engineState.$state));

    this.engineState.history.push({
      action: action,
      gameStateBefore: gameStateBefore,
      engineStateBefore: engineStateBefore,
    });
  }

  /**
   * Navigates back one step in the game's history.
   * Restores the game and engine state from the previous history entry.
   */
  async goBack(): Promise<void> {
    if (this.engineState.history.length > 0) {
      // Before going back, save the current state to 'future' for 'goForward'
      const currentAction = this.engineState.history[this.engineState.history.length - 1].action;
      const currentGameState = JSON.parse(JSON.stringify(this.gameState.$state));
      const currentEngineState = JSON.parse(JSON.stringify(this.engineState.$state));
      this.engineState.future.push({
        action: currentAction,
        gameStateBefore: currentGameState,
        engineStateBefore: currentEngineState,
      });

      const lastEntry = this.engineState.history.pop(); // Get the entry to revert to
      if (lastEntry) {
        // Restore state from before the last action
        Object.assign(this.gameState.$state, lastEntry.gameStateBefore);
        Object.assign(this.engineState.$state, lastEntry.engineStateBefore);

        // Update current event and action index to reflect the reverted state
        this.engineState.currentEvent = lastEntry.engineStateBefore.currentEvent;
        this.engineState.currentActionIndex = lastEntry.engineStateBefore.currentActionIndex;

        console.log("Went back in history. Current history length:", this.engineState.history.length);
        // Force UI update if necessary (Pinia reactivity should handle most of this)
      }
    } else {
      console.warn("No history to go back to.");
    }
  }

  /**
   * Navigates forward one step in the game's history (if 'goBack' was used).
   * Re-applies the action from the 'future' stack.
   */
  async goForward(): Promise<void> {
    if (this.engineState.future.length > 0) {
      const nextEntry = this.engineState.future.pop(); // Get the entry to re-apply
      if (nextEntry) {
        // Restore the state that was current *before* the goBack
        Object.assign(this.gameState.$state, nextEntry.gameStateBefore);
        Object.assign(this.engineState.$state, nextEntry.engineStateBefore);

        // Re-execute the action to move forward (this will also record it back to history)
        await this.processActionAndAwaitUser(nextEntry.action);

        console.log("Went forward in history. Current history length:", this.engineState.history.length);
      }
    }
  } else {
    console.warn("No future to go forward to.");
  }

  /**
   * Finds an event by its ID from the event cache.
   * @param eventId The ID of the event to find.
   * @returns The found VNEvent or null if not found.
   */
  findEventById(eventId: string): VNEvent | null {
    // This logic remains similar to the existing Engine.ts
    // It relies on EngineEvents.eventCache
    for (const location in (this as any).eventCache) { // Access eventCache from EngineEvents
      const cache = (this as any).eventCache[location];
      for (const list of ["unlocked", "locked", "notReady"] as const) {
        const found = cache[list].find((ev: VNEvent) => ev.id === eventId);
        if (found) {
          return found;
        }
      }
    }
    console.warn(`Event with id '${eventId}' not found`);
    return null;
  }

  // The following methods would be delegated to EngineEvents.ts or removed if no longer needed.
  // They are kept here for conceptual completeness, but their implementation would be in EngineEvents.
  createEventsCopy(): void {
    // Delegates to EngineEvents.createEventsCopy
    EngineEvents.createEventsCopy(this);
  }

  updateEvents(location?: string): void {
    // Delegates to EngineEvents.updateEvents
    EngineEvents.updateEvents(this, location);
  }
}

export default Engine;
```

### 3. `src/engine/runtime/EngineSave.ts` (Updated)

This file will be updated to save and load the `history` and `future` arrays within `engineState`. The `startEventReplay` function is completely removed as the engine's state (including `currentEvent` and `currentActionIndex`) and the history log provide all necessary context for resuming.

```typescript
// src/engine/runtime/EngineSave.ts

import { PROJECT_ID } from '@/generate/components';
import { engineStateEnum as ENGINE_STATES } from '@/generate/stores';
import type Engine from './NewEngine'; // Import the new Engine class

export const startNewGame = async (engine: Engine): Promise<void> => {
  engine.cancelAwaiter();
  engine.engineState.state = ENGINE_STATES.LOADING;
  await new Promise((resolve) => setTimeout(resolve, 100));
  engine.engineState.resetState();
  engine.gameState.resetGame();
  engine.engineState.history = []; // Clear history on new game
  engine.engineState.future = [];  // Clear future on new game
  engine.engineState.currentEvent = null; // Ensure no event is active
  engine.engineState.currentActionIndex = 0; // Reset action index
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

  // Reset states before loading
  engine.engineState.resetState();
  engine.gameState.resetGame();

  // Load game state and engine state, including history and future
  Object.assign(engine.gameState.$state, data.gameState);
  Object.assign(engine.engineState.$state, data.engineState);

  // Ensure history and future are properly initialized if not present in old saves
  if (!engine.engine.history) {
    engine.engineState.history = [];
  }
  if (!engine.engineState.future) {
    engine.engineState.future = [];
  }

  engine.createEventsCopy();
  engine.updateEvents();
  engine.engineState.initialized = true;
  // No startEventReplay needed. The engine will resume from currentEvent/currentActionIndex
  // or find a new event if currentEvent is null.
  engine.engineState.state = ENGINE_STATES.RUNNING;
};

export const saveGame = (engine: Engine, slot: string, name?: string): void => {
  console.log(`ENGINESAVE CALL: Saving game to slot ${slot}`);
  const data = {
    name: name || `Save ${slot}`,
    timestamp: new Date().toISOString(),
    // Deep copy to ensure reactivity is not broken by direct object assignment
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
```

### 4. `src/editor/docs/EventTemplates.ts` (Updated)

This template will guide users in writing events with the new `execute` method and the `EngineAPIForEvents`.

```typescript
// src/editor/docs/EventTemplates.ts

/**
 * @typedef {Object} VNEvent
 * @property {string} id - Unique identifier for the event.
 * @property {string} name - Display name of the event.
 * @property {(gameState: Object) => boolean} [conditions] - Optional function to determine if the event is available.
 * @property {(engine: import('../../engine/runtime/types').EngineAPIForEvents, gameState: Object) => Promise<void>} execute - The main logic of the event.
 */

export const eventTemplate: string = `/**
 * @typedef {Object} VNEvent
 * @property {string} id - Unique identifier for the event.
 * @property {string} name - Display name of the event.
 * @property {(gameState: Object) => boolean} [conditions] - Optional function to determine if the event is available.
 * @property {(engine: import('../../engine/runtime/types').EngineAPIForEvents, gameState: Object) => Promise<void>} execute - The main logic of the event.
 */

export default {
  id: 'new_event',
  name: 'Nouvel évènement',
  conditions: (gameState) => true, // Example condition: always true
  async execute(engine, gameState) {
    // --- Basic Dialogue and Background ---
    await engine.setBackground('assets/backgrounds/forest.jpg');
    await engine.showText('Bienvenue dans la forêt enchantée.', 'Narrator');

    // --- Direct GameState Manipulation (Type-safe) ---
    // You have direct access to gameState and its types here.
    gameState.flags.visitedForest = true;
    console.log('Flag visitedForest set to:', gameState.flags.visitedForest);

    // --- Conditional Logic and Branching ---
    if (gameState.player.name === 'Alice') {
      await engine.showText('Ah, Alice, vous revoilà !', 'Mysterious Voice');
      await engine.setBackground('assets/backgrounds/alice_special.jpg');
    } else {
      await engine.showText('Qui êtes-vous, étranger ?', 'Mysterious Voice');
    }

    // --- Handling Choices ---
    await engine.showText('Que souhaitez-vous faire ensuite ?', 'Narrator');
    const choiceId = await engine.showChoices([
      { text: 'Suivre le sentier lumineux', id: 'path_light' },
      { text: 'Explorer les buissons sombres', id: 'bushes_dark' },
      { text: 'Retourner au village', id: 'go_back_village' },
    ]);

    // --- Branching based on Choice ---
    switch (choiceId) {
      case 'path_light':
        await engine.showText('Vous suivez le sentier lumineux...', 'Narrator');
        engine.jump('event_light_path'); // Jump to another event
        break;
      case 'bushes_dark':
        await engine.showText('Vous vous enfoncez dans les buissons sombres...', 'Narrator');
        gameState.flags.foundSecret = true; // Update game state based on choice
        engine.jump('event_dark_bushes'); // Jump to another event
        break;
      case 'go_back_village':
        await engine.showText('Vous décidez de retourner au village.', 'Narrator');
        engine.jump('event_village_return'); // Jump to another event
        break;
      default:
        console.warn('Unhandled choice:', choiceId);
        // Fallback or error handling
        break;
    }

    // Note: Any code after a 'jump' will not be executed as 'jump' throws an interrupt.
    // Ensure your logic correctly handles the end of an event or a jump.
  }
}
`;
```

## Detailed Explanation of Key Concepts

### The `execute` Method and Action Emission

The `execute` method within a `VNEvent` is where the game developer defines the narrative flow. It receives two arguments:

1.  `engine: EngineAPIForEvents`: This object provides the interface to interact with the core engine. Methods like `engine.showText()`, `engine.setBackground()`, `engine.showChoices()`, and `engine.jump()` are available here.
2.  `gameState: GameState`: This is a direct reference to the game's state (e.g., `gameState.player`, `gameState.flags`). Developers can read from and write to `gameState` directly, leveraging TypeScript's type safety.

**How it works internally:**

When a developer calls `await engine.showText('...')` inside their `execute` method:

1.  The `engine.showText()` method (from `EngineAPIForEvents`) is invoked.
2.  Inside `engine.showText()`, it constructs a `VNAction` object (e.g., `{ type: 'showText', text: '...' }`).
3.  It then calls an internal method on the main `Engine` instance (e.g., `this.processActionAndAwaitUser(action)`). This call is `await`ed.
4.  The `processActionAndAwaitUser` method in `NewEngine.ts` performs the following critical steps:
    *   **State Snapshot:** It takes a deep copy of the current `gameState` and `engineState` and creates a `GameHistoryEntry`. This snapshot *includes any modifications made to `gameState` by the user's TypeScript code just before this `engine` API call*.
    *   **History Logging:** The `GameHistoryEntry` (containing the `VNAction` and the state snapshot) is pushed onto the `engineState.history` array.
    *   **Action Application:** The `VNAction` is then applied to the actual `engineState` (e.g., `engineState.dialogue` is updated).
    *   **User Await:** If the action requires user input (like `showText` or `showChoices`), it sets up an internal `awaiterResult` and pauses execution until the user provides input (e.g., clicks to continue, selects a choice).
    *   **Return Control:** Once the action is processed and any user input is received, `processActionAndAwaitUser` resolves its promise, returning control back to the `engine.showText()` method, which then returns control to the user's `execute` method.

This sequence ensures that every atomic step of the game is logged with its preceding state, regardless of how complex the TypeScript logic is between `engine` API calls.

### Choice Handling Example

The `engine.showChoices()` method returns the `id` of the chosen option. This allows developers to use standard TypeScript control flow (`if/else`, `switch`) to implement branching logic directly within their event's `execute` method.

```typescript
// Inside a VNEvent's execute method:
await engine.showText('Choose your destiny:', 'Narrator');
const choiceId = await engine.showChoices([
  { text: 'Path of Courage', id: 'courage' },
  { text: 'Path of Wisdom', id: 'wisdom' },
]);

switch (choiceId) {
  case 'courage':
    gameState.flags.playerTrait = 'courageous'; // Direct state update
    await engine.showText('You bravely step forward.', 'Narrator');
    engine.jump('event_courage_path'); // Jump to another event
    break;
  case 'wisdom':
    gameState.flags.playerTrait = 'wise'; // Direct state update
    await engine.showText('You ponder the options carefully.', 'Narrator');
    engine.jump('event_wisdom_path'); // Jump to another event
    break;
  default:
    console.warn('Unexpected choice:', choiceId);
    // Fallback or error handling
    break;
}
```
The `engine.jump('eventId')` call will internally create a `jump` `VNAction`. When `processActionAndAwaitUser` processes this `jump` action, it will set `engineState.currentEvent` to the target event's ID and then throw a `VNInterruptError`. This interrupt signals the `processEvent` method to stop executing the current event and allows the main `runGameLoop` to pick up the new `currentEvent`.

### Save and Load Concept

The save/load mechanism is greatly simplified and made more robust:

*   **Saving:** The `saveGame` function simply serializes the entire `engineState` (which includes `history`, `future`, `currentEvent`, and `currentActionIndex`) and the `gameState` to `localStorage`. Because `history` contains snapshots of both `gameState` and `engineState` before each action, the entire game's progression and state are preserved.
*   **Loading:** The `loadGame` function deserializes the saved `engineState` and `gameState` back into the engine. There is **no need for a separate "replay" function** like `startEventReplay`. The engine simply resumes from the `currentEvent` and `currentActionIndex` that were saved. If the `currentEvent` is `null`, it will find the next available event.

### Replay Event to Expected Point (Go Back/Go Forward)

The `history` and `future` arrays in `engineState` are the core of the replay functionality:

*   **`goBack()`:**
    1.  When `goBack()` is called, the *current* state (before going back) is pushed onto the `engineState.future` stack.
    2.  The last `GameHistoryEntry` is popped from `engineState.history`.
    3.  The `gameStateBefore` and `engineStateBefore` from this popped entry are used to restore the engine's state. This effectively reverts the game to the state it was in *before* the last `VNAction` was executed.
    4.  The `currentEvent` and `currentActionIndex` are also restored from the `engineStateBefore` snapshot, ensuring the engine knows exactly where it was in the event flow.
*   **`goForward()`:**
    1.  When `goForward()` is called, the last entry is popped from `engineState.future`.
    2.  The `gameStateBefore` and `engineStateBefore` from this entry are used to restore the state.
    3.  The `action` from this entry is then re-processed by calling `processActionAndAwaitUser()`. This re-executes the action, pushing a new `GameHistoryEntry` onto the `history` stack, effectively moving forward in time.

This mechanism allows for precise, step-by-step navigation through the game's entire history, making it truly "VN friendly."

## Benefits Summary

*   **Unrestricted TypeScript Logic:** Developers have full control over event logic, including complex conditionals and direct `gameState` manipulation, with TypeScript's type safety.
*   **Robust History and Replay:** The atomic action logging ensures a perfect, granular history, enabling reliable "go back," "go forward," and seamless save/load.
*   **Simplified Event Definition:** Events are now focused on their narrative and logical flow, rather than complex engine state management.
*   **Clear Separation of Concerns:** The user's event code defines *what* happens, while the core engine handles *how* it happens (rendering, history, state management).
*   **Intuitive API:** The `engine.method()` calls are familiar and easy to use, abstracting away the underlying history logging.
