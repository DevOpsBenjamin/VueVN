import type { GameState } from '../stores/GameState';

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
  accessibleLocations: string[]; // Array of location IDs player can navigate to - will be changed to Location objects later
  unlocked: (state: GameState) => boolean // Conditions for location to be discoverable
  accessErrors: ConditionalString[]// Conditions for location to be accessible (warns if fails)
}