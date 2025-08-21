# Proposed Engine Architecture: Deterministic Approach for VueVN

This document details a revised engine architecture for VueVN, focusing on a **deterministic, action-based approach**. This design ensures ultimate control over game state and history, enabling robust replay, rewind, and fast-forward functionalities, while still allowing developers to write flexible TypeScript logic within events.

## Core Principles

1.  **Atomic Actions (`VNAction`):** These remain the fundamental, granular units of game progression (e.g., showing text, changing background). They are crucial for building a precise history log.
2.  **Game History Log (`GameHistoryEntry`):** The engine maintains a comprehensive, ordered log of every `VNAction` executed, along with a snapshot of the `gameState` and `engineState` *before* that action. This log is the bedrock for "go back" and "go forward" functionality.
3.  **State Snapshotting:** Before each `VNAction` is processed by the core engine, a deep copy of the current `gameState` and `engineState` is taken and stored in the `history` log. This ensures that any modifications made by the user's TypeScript code (e.g., to `gameState.flags`) are accurately captured *before* the next atomic action is applied.
4.  **User-Defined `execute` Method:** Each `VNEvent` will have an `async execute(engine, gameState)` method. This is where the game developer writes their custom TypeScript logic, including conditional branching and direct `gameState` manipulation.
5.  **Engine API as Action Recorder (Simulation):** The `engine` object passed into the `execute` method will expose a set of high-level methods (e.g., `showText`, `showChoices`, `jump`). When these methods are called by the user, they do *not* directly modify the engine's live visual state. Instead, they internally record the corresponding `VNAction` into a sequence. The `execute` method runs in a **simulation mode** to generate this sequence.
6.  **Deterministic Choice Handling:** `showChoices` actions are designed to always lead to an immediate `jump` to another event. This simplifies the simulation process by avoiding complex branching logic within the simulation itself.
7.  **Engine as Action Playback System:** After an event's `execute` method has been simulated to generate its action sequence, the "real" engine then plays back this sequence, applying actions to the live state and handling user input.

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
  id: string; // Still useful for tracking the specific choice made
  jump_id: string; // The event ID to jump to if this choice is selected
};

/**
 * Defines the atomic actions that can be part of a visual novel event.
 * These are the fundamental operations logged in history.
 */
export type VNAction =
  | { type: 'showText'; text: string; from?: string }
  | { type: 'setBackground'; imagePath: string }
  | { type: 'setForeground'; imagePath: string }
  | { type: 'showChoices'; choices: Array<Choice> } // Choices now include jump_id
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
 * These methods record VNActions into the simulation sequence.
 */
export interface EngineAPIForEvents {
  showText: (text: string, from?: string) => Promise<void>;
  setBackground: (imagePath: string) => Promise<void>;
  setForeground: (imagePath: string) => Promise<void>;
  showChoices: (choices: Array<Choice>) => Promise<string>; // Returns the chosen ID
  jump: (eventId: string) => Promise<void>; // Records a jump action
}

/**
 * Represents a Visual Novel event.
 * Events now contain an `execute` method for custom TypeScript logic.
 */
export interface VNEvent {
  id: string;
  name: string;
  conditions?: (gameState: GameState) => boolean; // Conditions for the event to be available
  isJumpTarget?: boolean; // New flag: true if this event is primarily a target for jumps (not discovered by getEvents)
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
  currentActionIndex: number; // Index of the current action within the current event's action sequence
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
import type { GameState, EngineState, VNEvent, VNAction, GameHistoryEntry, EngineAPIForEvents, Choice } from "./types";

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

    // Initialize the EngineAPIForEvents instance for live execution
    // This will be used when actually playing back the simulated actions.
    // The simulation itself will use a different, temporary implementation.
    this.engineAPIForEvents = {
      showText: (text, from) => this.processActionAndAwaitUser({ type: 'showText', text, from }),
      setBackground: (imagePath) => this.processActionAndAwaitUser({ type: 'setBackground', imagePath }),
      setForeground: (imagePath) => this.processActionAndAwaitUser({ type: 'setForeground', imagePath }),
      showChoices: async (choices) => {
        const chosenId = await this.processActionAndAwaitUser({ type: 'showChoices', choices });
        // After choice, automatically perform the jump
        const chosenOption = choices.find(c => c.id === chosenId);
        if (chosenOption) {
          await this.processActionAndAwaitUser({ type: 'jump', eventId: chosenOption.jump_id });
        } else {
          console.error(`Chosen ID '${chosenId}' not found in choices.`);
        }
        return chosenId;
      },
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
   * Processes a VNEvent by executing its `execute` method in simulation mode
   * to generate the action sequence, then plays back that sequence.
   * @param event The VNEvent to process.
   */
  async processEvent(event: VNEvent): Promise<void> {
    console.debug(`Processing event: ${event.id}`);

    // 1. Simulate the event's execute method to get the full action sequence
    const simulatedActions = await this.simulateEventExecution(event);
    console.debug(`Event ${event.id} simulated. Actions:`, simulatedActions);

    // 2. Play back the simulated actions
    for (let i = this.engineState.currentActionIndex; i < simulatedActions.length; i++) {
      const action = simulatedActions[i];
      this.engineState.currentActionIndex = i; // Update current action index

      // Apply the action to the live state and record history
      await this.processActionAndAwaitUser(action);

      // If a jump occurred, the processActionAndAwaitUser will throw VNInterruptError
      // and the loop will be interrupted.
    }

    // If the loop completes, the event is finished
    this.engineState.currentEvent = null;
    this.engineState.currentActionIndex = 0;
    console.debug(`Event ${event.id} finished.`);
  }

  /**
   * Runs an event's `execute` method in a sandboxed simulation to generate its full action sequence.
   * @param event The event to simulate.
   * @returns A promise that resolves with the generated array of VNActions.
   */
  private async simulateEventExecution(event: VNEvent): Promise<VNAction[]> {
    const simulatedActions: VNAction[] = [];
    const simulatedGameState = JSON.parse(JSON.stringify(this.gameState.$state)); // Start with a copy of current game state

    // Create a temporary, simulated EngineAPIForEvents instance
    const simulatedEngineAPI: EngineAPIForEvents = {
      showText: async (text, from) => {
        simulatedActions.push({ type: 'showText', text, from });
        return Promise.resolve();
      },
      setBackground: async (imagePath) => {
        simulatedActions.push({ type: 'setBackground', imagePath });
        return Promise.resolve();
      },
      setForeground: async (imagePath) => {
        simulatedActions.push({ type: 'setForeground', imagePath });
        return Promise.resolve();
      },
      showChoices: async (choices) => {
        simulatedActions.push({ type: 'showChoices', choices });
        // In simulation, we don't know the choice. We return a dummy value.
        // The actual choice will be handled during live playback.
        // The jump will be recorded as a separate action after the choice.
        return Promise.resolve(choices[0].id); // Return first choice ID as a placeholder
      },
      jump: async (eventId) => {
        simulatedActions.push({ type: 'jump', eventId });
        // In simulation, a jump doesn't interrupt the simulation, it just records the action.
        return Promise.resolve();
      },
    };

    // Run the event's execute method in simulation mode
    try {
      await event.execute(simulatedEngineAPI, simulatedGameState); // Pass the simulated game state
    } catch (err) {
      // A jump action in simulation will not throw a VNInterruptError, it will just return.
      // Other errors should still be logged.
      console.error(`Error during simulation of event ${event.id}:`, err);
    }

    return simulatedActions;
  }

  /**
   * Processes a single VNAction: records history, applies to live state, and awaits user input.
   * This is used during live playback of simulated actions.
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
          this.engineState.currentActionIndex = 0; // New event starts from action 0
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
        // The runGameLoop will detect the changed currentEvent/currentActionIndex and re-process.
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
  if (!engine.engineState.history) {
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

This template will guide users in writing events with the new `execute` method and the `EngineAPIForEvents`, specifically demonstrating the simplified choice handling.

```typescript
// src/editor/docs/EventTemplates.ts

/**
 * @typedef {Object} VNEvent
 * @property {string} id - Unique identifier for the event.
 * @property {string} name - Display name of the event.
 * @property {(gameState: Object) => boolean} [conditions] - Optional function to determine if the event is available.
 * @property {boolean} [isJumpTarget] - True if this event is primarily a target for jumps (not discovered by getEvents).
 * @property {(engine: import('../../engine/runtime/types').EngineAPIForEvents, gameState: Object) => Promise<void>} execute - The main logic of the event.
 */

export const eventTemplate: string = `/**
 * @typedef {Object} VNEvent
 * @property {string} id - Unique identifier for the event.
 * @property {string} name - Display name of the event.
 * @property {(gameState: Object) => boolean} [conditions] - Optional function to determine if the event is available.
 * @property {boolean} [isJumpTarget] - True if this event is primarily a target for jumps (not discovered by getEvents).
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

    // --- Handling Choices (Simplified) ---
    // showChoices now automatically handles the jump after a choice is made.
    // Any code after showChoices will NOT be executed.
    await engine.showText('Que souhaitez-vous faire ensuite ?', 'Narrator');
    await engine.showChoices([
      { text: 'Suivre le sentier lumineux', id: 'path_light', jump_id: 'event_light_path' },
      { text: 'Explorer les buissons sombres', id: 'bushes_dark', jump_id: 'event_dark_bushes' },
      { text: 'Retourner au village', id: 'go_back_village', jump_id: 'event_village_return' },
    ]);

    // WARNING: Any code placed here will NOT be executed because showChoices
    // will trigger a jump to a new event. This event's execution will be interrupted.
    // Consider this the end of the event's active logic.
  }
}
`;
```

## Detailed Explanation of Key Concepts (Updated)

### The `execute` Method and Action Recording (Simulation)

The `execute` method within a `VNEvent` is where the game developer defines the narrative flow. It receives two arguments:

1.  `engine: EngineAPIForEvents`: This object provides the interface to interact with the core engine. Methods like `engine.showText()`, `engine.setBackground()`, `engine.showChoices()`, and `engine.jump()` are available here.
2.  `gameState: GameState`: This is a direct reference to the game's state (e.g., `gameState.player`, `gameState.flags`). Developers can read from and write to `gameState` directly, leveraging TypeScript's type safety.

**How it works internally (Simulation Phase):**

When a developer calls `await engine.showText('...')` inside their `execute` method:

1.  The `engine.showText()` method (from `EngineAPIForEvents`) is invoked.
2.  Inside `engine.showText()`, it constructs a `VNAction` object (e.g., `{ type: 'showText', text: '...' }`).
3.  This `VNAction` is then added to a temporary list of `simulatedActions` that is being built by the `simulateEventExecution` method.
4.  Crucially, during this simulation phase, no actual UI updates occur, no user input is awaited, and no history is recorded. The `execute` method runs to completion, generating the full sequence of `VNAction`s for its path.

### Deterministic Choice Handling

The `showChoices()` method is now designed to simplify branching in a deterministic way:

*   Each `Choice` object must include a `jump_id` property, specifying the ID of the event to jump to if that choice is selected.
*   When `engine.showChoices()` is called, it will:
    1.  Record a `showChoices` `VNAction` in the simulated sequence.
    2.  During *live playback*, it will present the choices to the user and await their input.
    3.  Once a choice is made (or simulated during fast-forward), it will automatically record a `jump` `VNAction` to the `jump_id` associated with the chosen option.
    4.  **Important:** Any code written in the `execute` method *after* a `showChoices` call will **not** be executed during live playback, as the `jump` action will interrupt the current event's execution. The engine should warn developers about such unreachable code.

This design ensures that branching is always handled by explicit jumps to new events, making the simulation and history management much more straightforward.

### Save and Load Concept (Updated)

The save/load mechanism is greatly simplified and made more robust:

*   **Saving:** The `saveGame` function simply serializes the entire `engineState` (which includes `history`, `future`, `currentEvent`, and `currentActionIndex`) and the `gameState` to `localStorage`. Because `history` contains snapshots of both `gameState` and `engineState` before each action, the entire game's progression and state are preserved.
*   **Loading:** The `loadGame` function deserializes the saved `engineState` and `gameState` back into the engine. There is **no need for a separate "replay" function**.

### Replay Event to Expected Point (Go Back/Go Forward) with Simulation

The `history` and `future` arrays in `engineState` are the core of the replay functionality, now powered by the deterministic simulation:

*   **`processEvent(event: VNEvent)` (Main Playback Loop):**
    1.  **Simulation Phase:** First, it calls `this.simulateEventExecution(event)` to run the event's `execute` method in a sandbox. This generates the complete `simulatedActions` sequence for that event.
    2.  **Playback Phase:** It then iterates through this `simulatedActions` array, starting from `engineState.currentActionIndex`. For each action:
        *   It calls `this.processActionAndAwaitUser(action)` to apply the action to the live `engineState`, record it in `history`, and await user input if necessary.
        *   If a `jump` action is encountered, `processActionAndAwaitUser` will throw a `VNInterruptError`, stopping the current event's playback and allowing the `runGameLoop` to pick up the new `currentEvent`.

*   **`simulateEventExecution(event: VNEvent)` (New Private Method):**
    *   This method runs the `event.execute()` in a sandboxed environment.
    *   It uses a special `simulatedEngineAPI` that only records `VNAction`s to an array, without affecting the live game state or awaiting user input.
    *   For `showChoices` actions during simulation, it will record the action and then implicitly assume a jump based on the `jump_id` (e.g., the first choice's `jump_id` or a historical one if replaying).

*   **`processActionAndAwaitUser(action: VNAction)` (Updated Private Method):**
    *   This method is responsible for applying a single `VNAction` to the live `engineState`, recording it in `history`, and handling user input.
    *   During `showChoices` playback, it will present the choices to the user and await their selection. The chosen `id` will then be used to trigger the corresponding `jump` action.

*   **`goBack()`:**
    1.  Pushes the current state onto `engineState.future`.
    2.  Pops the last `GameHistoryEntry` from `engineState.history`.
    3.  Restores `gameState` and `engineState` from the `gameStateBefore` and `engineStateBefore` of the popped entry.
    4.  The `runGameLoop` will then re-process the `currentEvent` from its new `currentActionIndex`, effectively replaying the event from that point.

*   **`goForward()`:**
    1.  Pops the next `GameHistoryEntry` from `engineState.future`.
    2.  Restores `gameState` and `engineState` from the `gameStateBefore` and `engineStateBefore` of the popped entry.
    3.  Calls `processActionAndAwaitUser()` with the `action` from the popped entry. This re-applies the action to the live state and records it back into `history`.

*   **Loading a Game (Resuming):**
    1.  `loadGame` restores `gameState` and `engineState` (including `history` and `future`).
    2.  The `runGameLoop` detects `engineState.currentEvent` and `engineState.currentActionIndex`.
    3.  It then calls `processEvent(currentEvent)`. `processEvent` will first `simulateEventExecution` to get the full action sequence, and then start playback from `engineState.currentActionIndex`, effectively resuming the game precisely where it was saved.

## Benefits Summary

*   **Unrestricted TypeScript Logic:** Developers have full control over event logic, including complex conditionals and direct `gameState` manipulation, with TypeScript's type safety.
*   **Robust History and Replay:** The atomic action logging ensures a perfect, granular history, enabling reliable "go back," "go forward," and seamless save/load.
*   **Deterministic Simulation:** The `execute` method runs in a sandbox, generating a predictable sequence of actions, which simplifies complex branching and replay logic.
*   **Simplified Choice Handling:** `showChoices` always leading to a `jump` makes event structure clearer and simulation easier.
*   **Clear Separation of Concerns:** The user's event code defines *what* happens, while the core engine handles *how* it happens (rendering, history, state management).
*   **Intuitive API:** The `engine.method()` calls are familiar and easy to use, abstracting away the underlying history logging.
