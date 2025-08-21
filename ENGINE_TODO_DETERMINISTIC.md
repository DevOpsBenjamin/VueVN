# ENGINE_TODO_DETERMINISTIC.md

This document outlines the step-by-step plan for implementing the deterministic engine architecture for VueVN, as detailed in `Engine_deterministic.md`.

## Phase 1: Core Type and Engine Structure

1.  **Update `src/engine/runtime/types.ts`:**
    *   Modify `Choice` type to include `jump_id: string`.
    *   Update `VNAction` type to include `runCustomLogic` with `logicId` and `args` (no `outcome`).
    *   Add `isJumpTarget?: boolean` to `VNEvent` interface.
    *   Update `EngineAPIForEvents` interface to include `runCustomLogic` (returning `Promise<void>`).
    *   Ensure `GameState` and `EngineState` include `history` and `future` arrays.

2.  **Create `src/engine/runtime/CustomLogicRegistry.ts`:**
    *   Create this new file with the `CustomLogicFunction` type, `registerCustomLogic`, and `getCustomLogic` functions.

3.  **Create `src/engine/runtime/NewEngine.ts`:**
    *   Copy the provided `NewEngine.ts` content from `Engine_deterministic.md`.
    *   Implement the `constructor`, `initVNInputHandlers`, `resolveAwaiter`, `cancelAwaiter`, `cleanAwaiter`, `run`, `runGameLoop`, `processEvent`, `simulateEventExecution`, `processActionAndAwaitUser`, `recordHistory`, `goBack`, `goForward`, `findEventById`, `createEventsCopy`, and `updateEvents` methods.
    *   **Crucial:** Ensure `processEvent` calls `simulateEventExecution` first, then iterates through the `simulatedActions` and calls `processActionAndAwaitUser` for each.
    *   **Crucial:** Implement the `simulatedEngineAPI` within `simulateEventExecution` to correctly record `VNAction`s (including `runCustomLogic` without executing the actual custom logic) without live side effects.
    *   **Crucial:** Implement `processActionAndAwaitUser` to execute `runCustomLogic` via `CustomLogicRegistry` and `await` its completion. For `goForward`, it will re-execute the custom logic.

4.  **Update `src/engine/runtime/Engine.ts`:**
    *   Rename the existing `Engine.ts` to `Engine.old.ts` or similar for backup.
    *   Rename `NewEngine.ts` to `Engine.ts`.

5.  **Update `src/engine/runtime/EngineSave.ts`:**
    *   Modify `startNewGame` to clear `history` and `future`.
    *   Modify `loadGame` to load `history` and `future` from saved data.
    *   Remove `startEventReplay` as it's no longer needed.

6.  **Update `src/editor/docs/EventTemplates.ts`:**
    *   Modify the `eventTemplate` to reflect the new `VNEvent` structure (with `execute` method), the simplified `showChoices` usage (with `jump_id`), and an example of `runCustomLogic`.

## Phase 2: Integration and Testing

1.  **Adjust Imports:** Update all relevant files (`src/main.ts`, `src/engine/app/Game.vue`, etc.) to import from the new `Engine.ts`.
2.  **Update `EngineEvents.ts`:** Ensure `EngineEvents.getEvents` and `EngineEvents.updateEvents` correctly handle the `isJumpTarget` flag, so that jump target events are not returned by `getEvents` unless explicitly desired.
3.  **Create Sample Events:** Develop a few simple events using the new `execute` and `showChoices` structure to test basic functionality.
    *   A linear event with `showText`, `setBackground`.
    *   An event with `showChoices` leading to different `jump_id`s.
    *   Target events for the jumps.
    *   An event demonstrating `runCustomLogic`.
4.  **Register Sample Custom Logic:** In `src/main.ts` or a dedicated setup file, register a dummy `CustomLogicFunction` for testing `runCustomLogic` (e.g., the `timingGame` example from `Engine_deterministic.md`).
5.  **Test Core Functionality:**
    *   Run a new game: Verify events play correctly.
    *   Test `goBack` and `goForward`: Ensure state reverts/advances correctly, including UI and `gameState` values. Verify `runCustomLogic` re-executes correctly.
    *   Test Save/Load: Save mid-event, load, and verify correct resumption. Save after a choice, load, and verify correct state. Save during a `runCustomLogic` (if possible), load, and verify correct re-execution.
    *   Test `jump` actions: Ensure they correctly interrupt events and transition to new ones.

## Phase 3: Refinements and Edge Cases

1.  **Error Handling:** Implement robust error handling for `execute` methods (e.g., if a `jump_id` is invalid, or `runCustomLogic` fails).
2.  **Unreachable Code Warning:** Implement a mechanism (e.g., a linter rule or runtime check) to warn developers if code exists after a `showChoices` call in an `execute` method.
3.  **Performance Optimization:** Monitor performance, especially for long `execute` methods or very deep history. Consider optimizations like history compression or partial state snapshots if needed.
4.  **UI Integration:** Ensure UI components (dialogue box, choice menu, background) correctly react to `engineState` changes.

This plan provides a clear roadmap for implementing the deterministic engine. Each step builds upon the previous one, ensuring a structured and manageable development process.