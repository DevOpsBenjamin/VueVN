import type { GameState } from '@generate/types';
import type { LocationResources } from './LocationResources';

type ConditionalString =
{
  check: (state: GameState) => boolean,
  value: string;
}

export interface Location {
  name: string;
  baseBackground: string; // Default background asset path
  timeBackgrounds?: ConditionalString[]; // Optional time-based backgrounds
  accessibleLocations: string[];
  unlocked: (state: GameState) => boolean // Conditions for location to be discoverable
  accessErrors: ConditionalString[]// Conditions for location to be accessible (warns if fails)
}