# Proposed Engine Architecture Changes for VueVN

This document outlines a new architecture for the VueVN engine, designed to address issues related to event simplicity, robust replay functionality, and enhanced save/load capabilities.

## Core Principles

1.  **Atomic Actions:** Events are composed of simple, predefined, atomic actions. This makes events easier to write, understand, and process programmatically.
2.  **Game History Log:** A comprehensive log of all executed actions and their corresponding game states is maintained. This log is the foundation for "go back" and "go forward" functionality.
3.  **State Snapshotting:** Before each action, the current game and engine state are snapshotted and stored in the history log.
4.  **Simplified Event Definition:** Events no longer contain complex `execute` functions. Instead, they are arrays of atomic actions.

## Key Changes and New Components

### 1. `src/engine/runtime/types.ts` (Updated)

This file will define the new `VNAction` and `GameHistoryEntry` types, and update `VNEvent` and `EngineState` to incorporate the new concepts.

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
 * Each action represents a single, distinct operation the engine can perform.
 */
export type VNAction =
  | { type: 'showText'; text: string; from?: string }
  | { type: 'setBackground'; imagePath: string }
  | { type: 'setForeground'; imagePath: string }
  | { type: 'showChoices'; choices: Array<Choice> }
  | { type: 'jump'; eventId: string } // Jumps to another event by ID
  | { type: 'setFlag'; flag: string; value: any } // Sets a game flag
  | { type: 'callFunction'; functionName: string; args: any[] }; // Calls a custom function (advanced)

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
 * Represents a Visual Novel event.
 * Events are now a sequence of atomic actions.
 */
export interface VNEvent {
  id: string;
  name: string;
  conditions?: (gameState: GameState) => boolean; // Conditions for the event to be available
  actions: VNAction[]; // The sequence of atomic actions that make up this event
  // The 'execute' function is removed from VNEvent as actions are processed by the engine.
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
  currentActionIndex: number; // Index of the current action within the current event's actions array
  choices: Array<Choice> | null;
  history: GameHistoryEntry[]; // The main history log for "go back"
  future: GameHistoryEntry[]; // A temporary stack for "go forward" (when "go back" is used)
}
```

### 2. `src/engine/runtime/NewEngine.ts` (New File)

This will be the new core `Engine` class, replacing the existing `Engine.ts`. It will be responsible for processing actions, managing the history, and handling game flow.

```typescript
// src/engine/runtime/NewEngine.ts

import {
  EngineEvents, // Still used for event discovery/management
  VNInterruptError,
} from "@/generate/runtime"; // Assuming EngineEvents is updated to new system
import { engineStateEnum as ENGINE_STATES } from "@/generate/stores";
import type { GameState, EngineState, VNEvent, VNAction, GameHistoryEntry } from "./types";

class Engine {
  gameState: GameState;
  engineState: EngineState;
  awaiterResult: ((value: any) => void) | null;

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
      // Get immediate and drawable events from EngineEvents
      const { immediateEvent, drawableEvents } = await EngineEvents.getEvents(this);

      if (immediateEvent) {
        this.engineState.currentEvent = immediateEvent.id;
        this.engineState.currentActionIndex = 0; // Start from the first action of the new event
        await this.processEvent(immediateEvent);
      } else {
        // Handle drawable events (e.g., choices that are always available on screen)
        // For now, this is a placeholder. Drawable events would typically be rendered
        // by UI components and their selection would trigger a new event or action.
      }
      // Small sleep for debugging/preventing tight loops in case of no events
      console.log("Petit sleep pour debug l'engine...");
      await new Promise((resolve) => setTimeout(resolve, 20000));
    }
  }

  /**
   * Processes a VNEvent by executing its sequence of actions.
   * @param event The VNEvent to process.
   */
  async processEvent(event: VNEvent): Promise<void> {
    for (let i = this.engineState.currentActionIndex; i < event.actions.length; i++) {
      const action = event.actions[i];

      // Record the state *before* executing the action
      this.recordHistory(action);

      await this.executeAction(action);
      this.engineState.currentActionIndex = i + 1; // Move to the next action
    }
    // Event finished, reset current event state
    this.engineState.currentEvent = null;
    this.engineState.currentActionIndex = 0;
  }

  /**
   * Executes a single VNAction.
   * @param action The VNAction to execute.
   */
  async executeAction(action: VNAction): Promise<void> {
    switch (action.type) {
      case 'showText':
        this.engineState.dialogue = { from: action.from || "engine", text: action.text };
        // Wait for user input to continue
        await new Promise((resolve) => { this.awaiterResult = resolve; });
        break;
      case 'setBackground':
        this.engineState.background = action.imagePath;
        break;
      case 'setForeground':
        this.engineState.foreground = action.imagePath;
        break;
      case 'showChoices':
        this.engineState.choices = action.choices;
        // Wait for user to make a choice
        const choiceId = await new Promise<string>((resolve) => { this.awaiterResult = resolve; });
        // After choice, record it in the last history entry
        if (this.engineState.history.length > 0) {
          this.engineState.history[this.engineState.history.length - 1].choiceMade = choiceId;
        }
        // Logic to handle the choice (e.g., jump to a specific event based on choiceId)
        // This would typically be handled by the event logic itself, or a subsequent 'jump' action.
        break;
      case 'jump':
        const nextEvent = this.findEventById(action.eventId);
        if (nextEvent) {
          this.engineState.currentEvent = nextEvent.id;
          this.engineState.currentActionIndex = 0;
          // Interrupt the current event processing to immediately start the new event
          throw new VNInterruptError("Jump to new event");
        } else {
          console.error(`Event with id '${action.eventId}' not found for jump action.`);
        }
        break;
      case 'setFlag':
        this.gameState.flags[action.flag] = action.value;
        break;
      case 'callFunction':
        // This is for advanced users to call custom functions defined elsewhere.
        // Requires a mechanism to register and retrieve these functions.
        console.warn(`'callFunction' action not fully implemented: ${action.functionName}. Implement a function registry.`);
        // Example: (window as any)[action.functionName](...action.args);
        break;
      default:
        console.warn(`Unknown action type: ${(action as any).type}`);
    }
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
      // Move the current state to the 'future' stack before going back
      const currentAction = this.engineState.history[this.engineState.history.length - 1].action;
      const currentGameState = JSON.parse(JSON.stringify(this.gameState.$state));
      const currentEngineState = JSON.parse(JSON.stringify(this.engineState.$state));
      this.engineState.future.push({
        action: currentAction, // The action that led to the current state
        gameStateBefore: currentGameState,
        engineStateBefore: currentEngineState,
      });

      const lastEntry = this.engineState.history.pop(); // Get the entry to revert to
      if (lastEntry) {
        // Restore state from before the last action
        Object.assign(this.gameState.$state, lastEntry.gameStateBefore);
        Object.assign(this.engineState.$state, lastEntry.engineStateBefore);

        // Adjust current event and action index to reflect the reverted state
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

        // Re-execute the action to move forward
        this.recordHistory(nextEntry.action); // Re-add to history
        await this.executeAction(nextEntry.action);

        console.log("Went forward in history. Current history length:", this.engineState.history.length);
      }
    } else {
      console.warn("No future to go forward to.");
    }
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

This file will be updated to save and load the new `history` and `future` arrays in `engineState`. The `startEventReplay` function will be removed as it's no longer needed with the history-based replay.

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
  // startEventReplay is no longer needed as history handles state restoration
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

This file will be updated to reflect the new event structure, making it easier for users to write events using the atomic action approach.

```typescript
// src/editor/docs/EventTemplates.ts

export const eventTemplate: string = `/**
 * @typedef {Object} VNEvent
 * @property {string} id - Unique identifier for the event.
 * @property {string} name - Display name of the event.
 * @property {(gameState: Object) => boolean} [conditions] - Optional function to determine if the event is available.
 * @property {Array<VNAction>} actions - The sequence of atomic actions that make up this event.
 *
 * @typedef {import('../../engine/runtime/types').VNAction} VNAction
 */

export default {
  id: 'new_event',
  name: 'Nouvel évènement',
  conditions: (gameState) => true, // Example condition: always true
  actions: [
    { type: 'showText', text: 'Début de l\'évènement...', from: 'Narrator' },
    { type: 'setBackground', imagePath: 'assets/backgrounds/forest.jpg' },
    { type: 'showText', text: 'Un choix s\'offre à vous.', from: 'Character A' },
    { type: 'showChoices',
      choices: [
        { text: 'Prendre le chemin de gauche', id: 'path_left' },
        { text: 'Prendre le chemin de droite', id: 'path_right' }
      ]
    },
    // Example of handling choices (this would typically be in a subsequent event or action)
    // For simplicity, a 'jump' action can be used after a choice is made.
    // The choice ID would be captured by the engine and could influence subsequent 'jump' actions
    // or 'setFlag' actions based on conditional logic in the event.
    { type: 'setFlag', flag: 'has_made_choice', value: true },
    // Example of jumping to another event based on a condition (e.g., after a choice)
    // This logic would need to be implemented in the event's action sequence or a separate event.
    // { type: 'jump', eventId: 'event_after_choice_left' },
  ]
}
`;
```

## How this addresses the problems:

*   **Event Simplicity/Flexibility:** Events are now simple arrays of actions. New actions can be added to `VNAction` type, making the engine highly extensible without modifying core event logic. The `execute` function is gone, simplifying event creation.
*   **Replay/Navigation (Go Back/Go Next):** The `history` array in `EngineState` provides a complete log of game progression. `goBack()` and `goForward()` methods leverage this history to restore previous states, enabling robust navigation.
*   **Save/Load Robustness:** By saving the entire `engineState` (which now includes `history` and `future`), the game can be fully restored to any point, including its navigation history. The hacky `startEventReplay` is removed.
*   **VN Friendly:** The atomic actions make it very clear what an event does. The "go back/go next" functionality is crucial for a good VN experience.
