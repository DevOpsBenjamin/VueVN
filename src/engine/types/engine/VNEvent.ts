import type { GameState, EngineAPI, Branch } from '@/generate/types';

/**
 * Visual Novel Event Interface
 * 
 * Event Flow: NotReady → Unlocked → Played → (optionally) Locked
 * 
 * 1. **NotReady**: Event is waiting for unlock conditions to be met
 * 2. **Unlocked**: Event is available for execution when conditions are met
 * 3. **Played**: Event has been executed (handled by engine, not explicitly tracked here)
 * 4. **Locked**: Event is permanently removed from consideration (e.g., one-time events)
 */
export interface VNEvent {
  /** Unique identifier for this event */
  id: string;
  
  /** Human-readable name for this event */
  name: string;
  
  /** 
   * Runtime conditions that must be true for event to execute.
   * Called every frame when event is unlocked.
   * Use for dynamic conditions like time, location, etc.
   */
  conditions: (state: GameState) => boolean;
  
  /** 
   * Determines if event should be moved from NotReady to Unlocked state.
   * Called during cache updates.
   * Use for story progression gates, level requirements, etc.
   */
  unlocked: (state: GameState) => boolean;
  
  /** 
   * Determines if event should be permanently removed (moved to Locked state).
   * Called during cache updates.
   * Use for one-time events, completed storylines, expired content, etc.
   * Once locked, events are never considered for execution again.
   */
  locked: (state: GameState) => boolean;
  
  /** 
   * Optional drawing function for events that appear in UI lists.
   * If undefined, event is considered "immediate" and executes automatically.
   */
  draw?: (engine: EngineAPI, state: GameState) => void;
  
  /** 
   * Main event execution function.
   * Called when event conditions are met and event is triggered.
   */
  execute: (engine: EngineAPI, state: GameState) => Promise<void>;
  
  /** 
   * Optional choice branches that can be triggered from this event.
   * Used with engine.showChoice() for branching narratives.
   */
  branches?: Record<string, Branch>;
}