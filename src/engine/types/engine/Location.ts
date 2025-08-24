import type { GameState } from '@/generate/types';

type ConditionalString =
{
  check: (state: GameState) => boolean,
  value: string;
}

export interface Location {
  id: string;
  name: string;
  baseBackground: string; // Default background asset path
  timeBackgrounds?: ConditionalString[]; // Optional time-based backgrounds
  // Array of locations we can move into.
  // Empty on init should be filled but LocationLinker.ts
  accessibleLocations: Location[];
  unlocked: (state: GameState) => boolean // Conditions for location to be discoverable
  accessErrors: ConditionalString[]// Conditions for location to be accessible (warns if fails)
}