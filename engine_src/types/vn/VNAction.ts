import type { GameState } from '@generate/types';

/**
 * Visual Novel Action Interface
 *
 * Actions are player-triggered operations that appear in the action overlay for the
 * current location (plus global actions). They are lightweight compared to events
 * and typically set flags or update state to route into VN events on the next loop.
 *
 * Typical flow
 * 1. Engine computes accessible actions for the current location (unlocked === true).
 * 2. Player clicks an action in the UI (ActionOverlay.vue).
 * 3. execute() runs synchronously to update GameState (e.g., set a flag).
 * 4. The engine loop sees changed state and may trigger a VNEvent.
 *
 * Authoring guidelines
 * - Keep execute() side effects small and predictable (set flags, counters, or ids).
 * - Do not perform long async work here; events handle narrative playback.
 * - Prefer snake_case id matching the filename (used in generated maps).
 * - unlocked() should be fast and pure (derive from GameState only).
 *
 * Example
 * const talk_barista: VNAction = {
 *   id: 'talk_barista',
 *   name: 'Talk to Maya',
 *   unlocked: (state) => state.gameTime.hour >= 7 && state.gameTime.hour < 19,
 *   execute: (state) => { state.flags.talk_barista = true; }
 * };
 */
export interface VNAction {
  /** Unique id for this action (prefer snake_case; typically matches filename). */
  id: string;

  /** Human-readable name displayed in the action overlay button. */
  name: string;

  /** Return true when this action should be available to the player. */
  unlocked: (state: GameState) => boolean;

  /**
   * Execute the action. Runs synchronously and should mutate GameState minimally
   * (e.g., set a flag) so the engine can route into the proper VNEvent afterward.
   */
  execute: (state: GameState) => void;
}

