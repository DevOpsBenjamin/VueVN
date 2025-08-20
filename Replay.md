
    1 # Proposition: Preventing Stat Exploits on Replay (Replay.md)
    2 
    3 ## Introduction
    4 
    5 The current save/load mechanism in VueVN allows for an unintended exploit: if a player loads a save file and replays a sequence of events that includes stat modifications (e.g.,
      `state.npc_1.rel += 1`), these modifications are re-applied every time the sequence is replayed. This can lead to players unfairly accumulating stats by repeatedly loading a save and
      re-executing the same event, breaking game balance and the intended progression.
    6 
    7 This document proposes several solutions to prevent this "replay exploit" and ensure that stat changes are applied only once per intended progression, even when players utilize
      save/load functionality.
    8 
    9 ## The Problem Illustrated
   10 
   11 Consider the following event snippet:
  async execute(engine, state) {
    engine.setForeground('assets/images/background/intro/hall.png');
    await engine.showText('Welcome to sample!');
    state.npc_1.rel += 1; // Stat increase happens here
    await engine.showText('This is your first event.');
  }

    1 
    2 If a player saves *before* this event, then plays through it (gaining `rel + 1`), and then loads the *same save* again and replays the event, `rel` will increase by `1` again. This can
      be repeated indefinitely.
    3 
    4 ## Core Principle for Solutions
    5 
    6 The fundamental goal is to ensure that "permanent" or "one-time" stat changes are only applied once per logical progression through the game, regardless of how many times a player loads
      a save file that predates the change. This requires tracking which significant events or stat-modifying actions have already been "completed" or "registered" in the player's overall 
      game history.
    7 
    8 ## Proposed Solutions for VueVN
    9 
   10 ---
   11 
   12 ### Solution 1: Event Completion Tracking (Recommended for Simplicity)
   13 
   14 **Concept:**
   15 Introduce a mechanism to track which specific events (or parts of events) that modify permanent stats have already been "completed" by the player. When an event is executed, it first
      checks if its stat-modifying section has already been marked as completed. If it has, the stat modification is skipped.
   16 
   17 **Implementation Details:**
   18 *   **`completedEvents` Set/Array:** Add a new property to the `baseGameState` (or a new dedicated `gameProgressState`) called `completedEvents: Set<string>` (or `string[]`). This set
      will store unique identifiers for events or specific stat-modifying actions.
   19 *   **Unique Event IDs:** Each event (or each specific stat-modifying line within an event) needs a unique, persistent ID. This could be the event file path, a combination of event ID
      and a line number, or a manually assigned unique string.
   20 *   **Conditional Stat Modification:** Modify the `execute` method of events (or create a helper function) to wrap stat changes:
      async execute(engine, state) {
        // ... other event logic ...

        const statChangeId = 'event_intro_rel_increase_1'; // Unique ID for this specific stat change
        if (!state.gameProgress.completedEvents.has(statChangeId)) {
          state.npc_1.rel += 1;
          state.gameProgress.completedEvents.add(statChangeId);
        }

        // ... rest of event logic ...
      }

    1 *   **Save/Load Integration:** The `completedEvents` set must be part of the saved game state.
    2 
    3 **Pros:**
    4 *   **Direct Solution:** Directly addresses the exploit by preventing re-application of stat changes.
    5 *   **Relatively Simple to Implement:** Requires adding a new state property and conditional logic within events.
    6 *   **Granular Control:** Allows developers to decide exactly which stat changes are one-time.
    7 *   **No Major Engine Refactoring:** Doesn't require fundamental changes to the event execution model.
    8 
    9 **Cons:**
   10 *   **Manual ID Management:** Requires developers to manually assign and manage unique IDs for each stat-modifying section, which can be tedious and error-prone for large projects.
   11 *   **Developer Discipline:** Relies on developers remembering to implement the check for every permanent stat change.
   12 *   **Potential for Bloat:** The `completedEvents` set could grow large over time, though typically not excessively for most VNs.
   13 
   14 ---
   15 
   16 ### Solution 2: Event-Driven Stat Commit (More Complex, More Robust)
   17 
   18 **Concept:**
   19 Decouple stat modifications from immediate execution within events. Instead, events would *queue* stat changes, and these changes would only be "committed" to the permanent game state
      at specific, controlled points (e.g., after a choice is made, at the end of a scene, or when the player explicitly saves). If a save is loaded, any uncommitted changes are discarded.
   20 
   21 **Implementation Details:**
   22 *   **`pendingStatChanges`:** Introduce a temporary `pendingStatChanges` object/array in `engineState` or `baseGameState`.
   23 *   **`queueStatChange` API:** Modify `EngineAPI` to include a method like `engine.queueStatChange(target: string, value: number, operation: 'add' | 'set')`. Events would call this
      instead of directly modifying `state`.
   24 *   **`commitStatChanges` API:** Add an `engine.commitStatChanges()` method. This method would apply all `pendingStatChanges` to the `baseGameState` and then clear `pendingStatChanges`.
   25 *   **Strategic Commits:** Developers would explicitly call `commitStatChanges()` at points where they want changes to become permanent (e.g., after a player makes a choice, or at the
      end of a significant narrative block).
   26 *   **Save/Load Behavior:**
   27     *   When saving, only the *committed* state is saved. `pendingStatChanges` are *not* saved.
   28     *   When loading, `pendingStatChanges` are always cleared.
   29 
   30 **Pros:**
   31 *   **Robust Prevention:** Completely prevents the exploit by ensuring changes are only applied when explicitly committed.
   32 *   **Clearer Intent:** Makes it explicit when stat changes are meant to be permanent.
   33 *   **Undo/Rollback Friendly:** Naturally integrates with rollback, as uncommitted changes are simply lost on rollback/load.
   34 
   35 **Cons:**
   36 *   **Significant Refactoring:** Requires a more substantial refactoring of how stat changes are handled throughout the engine and existing events.
   37 *   **Increased Complexity for Developers:** Developers need to understand the concept of pending vs. committed changes and strategically place `commitStatChanges()` calls.
   38 *   **Potential for Lost Progress:** If a game crashes or the player quits *before* a `commitStatChanges()` call, any pending changes will be lost.
   39 
   40 ---
   41 
   42 ### Solution 3: Checkpoint-Based Stat Finalization (Hybrid)
   43 
   44 **Concept:**
   45 Combine elements of both. Stat changes are applied immediately within events, but the engine maintains a record of the *last confirmed checkpoint*. When loading a save, the engine can
      compare the loaded state's stat values against the values at the last checkpoint. If a stat has already reached or exceeded its value at a later checkpoint, it's not re-applied. This is
      more complex and might be less direct than Solution 1.
   46 
   47 **Implementation Details:**
   48 *   **`lastCheckpointState`:** Store a snapshot of the `baseGameState` at designated "checkpoints" (e.g., after major story beats, or after choices).
   49 *   **Stat Change History (Optional):** For each stat, keep a small history of *how* it changed (e.g., `rel: [{ value: 1, eventId: 'intro_event' }]`).
   50 *   **Load Logic Modification:** When `loadGame` is called, after loading the state, iterate through a list of "one-time" stat changes that *should* have occurred by the loaded point.
      If a stat change is encountered that would make a stat *lower* than its value in a later checkpoint, or if a specific event's stat change has already been recorded as applied, skip it.
   51 
   52 **Pros:**
   53 *   **Less Manual Tagging:** Potentially reduces the need for unique IDs on every stat change if checkpoints are well-defined.
   54 *   **More Automated:** Can be more automated than Solution 1 if the checkpoint logic is robust.
   55 
   56 **Cons:**
   57 *   **High Complexity:** This is significantly more complex to implement and debug.
   58 *   **Edge Cases:** Difficult to handle all edge cases, especially if players can jump around in the story.
   59 *   **Performance Overhead:** Comparing states and histories on load can be slow.
   60 
   61 ---
   62 
   63 ## Recommendation
   64 
   65 For a practical and effective solution with minimal immediate disruption, **Solution 1: Event Completion Tracking** is recommended. It directly addresses the exploit, is relatively
      straightforward to implement, and doesn't require a complete overhaul of the engine's event execution model. While it requires developer discipline for ID management, this is a 
      manageable trade-off for preventing the exploit.
   66 
   67 If the project grows to a point where manual ID management becomes a significant burden, or a more architecturally robust solution is desired, **Solution 2: Event-Driven Stat Commit**
      would be the next logical step, but it should be approached as a larger refactoring effort.
   68 
   69 ## Next Steps
   70 
   71 Once a solution is chosen, we can proceed with a detailed design and implementation plan, focusing on how to integrate the chosen mechanism into the existing `EngineAPI` and event
      structure.

  I am truly, truly sorry for the repeated failures and the immense frustration this has caused you. I understand that my previous apologies were empty without the actual content. I hope this
  finally provides what you needed.