# Proposition: Implementing a "Go Back" (Rollback) Feature in VueVN

## Introduction

The current VueVN engine, while highly extensible due to its `await`-based event execution, lacks a built-in mechanism to "go back" or "rollback" to previous game states, similar to the functionality found in visual novel engines like Ren'Py. This document proposes several approaches to introduce such a feature, allowing players to revisit past choices or moments in the game.

## Current Engine Overview (Relevant to Rollback)

*   **Asynchronous Event Execution:** Events and commands are executed sequentially using `await`, meaning the game state is updated progressively.
*   **Mutable State:** The game state (dialogue, character positions, choices, variables) is directly modified during event execution.
*   **Save/Load System:** The `EngineSave.ts` module provides `saveGame` and `loadGame` functions, which serialize and deserialize the entire game state. This is a crucial foundation for any rollback mechanism.

## Ren'Py Rollback Mechanism (Brief Overview)

Ren'Py typically implements rollback by:
1.  **Snapshotting:** Periodically saving complete snapshots of the game state (variables, scene, character positions, dialogue history) to a history stack.
2.  **Rollback Points:** Designating specific actions (e.g., player choices, scene transitions) as points to which the player can roll back.
3.  **Restoration:** When a rollback is triggered, a previous snapshot is loaded from the history stack.

## Proposed Solutions for VueVN

Here are multiple approaches to implement a "go back" feature in VueVN, along with their pros and cons:

---

### Solution 1: Full State Snapshotting on Every Significant Event

**Concept:**
This approach involves saving a complete snapshot of the game's state to a history stack (an array of saved states) every time a "significant" event occurs. Significant events could include:
*   Displaying a new dialogue line.
*   Presenting choices to the player.
*   Changing the background or foreground.
*   Modifying a game variable.

When the player triggers "go back," the engine pops the last state from the history stack and loads it.

**Implementation Details:**
*   Modify `Engine.ts` or `EngineAPI.ts` to call `saveGame` (or a similar state-capturing function) at the end of each relevant command execution.
*   Maintain a `historyStack: GameState[]` (or similar) in `engineState.ts` or a new dedicated store.
*   Implement a `goBack()` function that pops a state from `historyStack` and calls `loadGame` with it.
*   Consider a maximum history size to prevent excessive memory usage.

**Pros:**
*   **Simplicity:** Conceptually straightforward to implement, leveraging the existing `saveGame`/`loadGame` functionality.
*   **Accuracy:** Provides a precise restoration of the game state at each snapshot point.
*   **Robustness:** Handles complex state changes without needing to re-execute events.

**Cons:**
*   **Memory Usage:** Storing full game state snapshots can consume a significant amount of memory, especially for long games or frequent snapshots.
*   **Performance:** Saving and loading large states frequently can introduce performance overhead, potentially causing stuttering.
*   **Granularity:** Might save more states than strictly necessary, leading to a less fluid "go back" experience if the player has to press "go back" many times to skip minor dialogue changes.

---

### Solution 2: Event Replay with State Deltas

**Concept:**
Instead of saving full states, this approach focuses on recording the *sequence of events and player choices*. When a rollback occurs, the engine rewinds to a specific "rollback point" (e.g., before a choice) and then re-executes events from that point, applying only the necessary state changes (deltas) or re-running the entire sequence.

**Implementation Details:**
*   **Event History:** Maintain a history of executed events and player choices (e.g., `eventHistory: { eventId: string, choiceMade?: number }[]`).
*   **Rollback Points:** Define specific events (e.g., `showChoices`) as explicit rollback points.
*   **Re-execution Logic:** When rolling back, load the state *before* the rollback point, then re-execute events from that point up to the desired previous state. This would require the engine to be able to re-run events deterministically.
*   **State Deltas (Optional but Recommended):** Instead of full re-execution, record "deltas" (changes) to the state for each event. When rolling back, apply the inverse of these deltas. This is significantly more complex.

**Pros:**
*   **Memory Efficiency:** Potentially much lower memory usage than full state snapshotting, as only event IDs and choices are stored.
*   **Flexibility:** Allows for more granular control over what constitutes a "rollback point."

**Cons:**
*   **Complexity:** Significantly more complex to implement, especially if state deltas are involved.
*   **Determinism Requirement:** The engine's event execution must be perfectly deterministic. Any non-deterministic behavior (e.g., random numbers not seeded, external API calls) would break rollback.
*   **Re-execution Performance:** Re-executing a long sequence of events can be slow, especially if there are many visual updates.
*   **Debugging:** Debugging issues with re-execution can be challenging.

---

### Solution 3: Hybrid Approach (Snapshotting at Choices, Deltas for Dialogue)

**Concept:**
This approach combines elements of both previous solutions to balance memory usage and accuracy. Full state snapshots are taken at critical "decision points" (e.g., before player choices). For sequences of events between these decision points (e.g., dialogue lines), only the event history or minimal deltas are recorded.

**Implementation Details:**
*   **Choice Snapshots:** When `showChoices` is called, save a full game state snapshot to the history stack.
*   **Dialogue/Minor Event History:** For dialogue lines and other minor events, record only the event ID or a small delta.
*   **Rollback Logic:**
    *   If rolling back to a choice, load the full snapshot.
    *   If rolling back within a dialogue sequence, re-execute the dialogue events from the last choice snapshot.

**Pros:**
*   **Balanced Memory/Performance:** Reduces memory overhead compared to full snapshotting while maintaining accuracy at critical points.
*   **Improved User Experience:** Allows players to quickly go back to choices, which is often the primary use case for rollback.

**Cons:**
*   **Increased Complexity:** More complex than simple full snapshotting, as it requires managing two types of history.
*   **Partial Re-execution:** Still requires deterministic re-execution for dialogue sequences, though the scope is smaller.

---

### Solution 4: Command Pattern with Undo/Redo

**Concept:**
This is a more architectural approach where every action that modifies the game state is encapsulated as a "Command" object. Each Command object would have an `execute()` method and an `undo()` method. When an action is performed, its Command object is pushed onto a stack. To "go back," the `undo()` method of the last Command is called, and it's popped from the stack.

**Implementation Details:**
*   **Command Interface:** Define an interface for `Command` objects with `execute()` and `undo()` methods.
*   **Wrap EngineAPI:** Refactor `EngineAPI` commands (e.g., `showDialogue`, `showChoices`, `setBackground`) to return or execute `Command` objects.
*   **Command Stack:** Maintain a `commandStack: Command[]` in the engine.
*   **`goBack()`:** Pop the last command from the stack and call its `undo()` method.

**Pros:**
*   **Clean Architecture:** Promotes a clean, modular design for state changes.
*   **Fine-grained Control:** Allows for very precise undo/redo functionality.
*   **Extensibility:** Easy to add new commands with undo capabilities.

**Cons:**
*   **Major Refactoring:** Requires a significant refactoring of the entire `EngineAPI` and how state changes are handled.
*   **Complexity of `undo()`:** Implementing the `undo()` method for each command can be complex, especially for commands that have side effects or interact with external systems.
*   **State Dependencies:** `undo()` methods must correctly reverse all state changes, which can be tricky if commands have interdependencies.

---

## Recommendation

For a first iteration, **Solution 1 (Full State Snapshotting on Every Significant Event)** is the most straightforward to implement, leveraging existing `saveGame`/`loadGame` functionality. While it has memory implications, it provides the most robust and accurate rollback experience with the least amount of refactoring.

If memory becomes a significant issue, or a more granular rollback is desired, **Solution 3 (Hybrid Approach)** would be the next logical step, building upon the foundation of Solution 1. Solution 2 and 4 are more complex and would require a deeper architectural overhaul.

## Next Steps

Once a solution is chosen, we can proceed with a detailed design and implementation plan.
