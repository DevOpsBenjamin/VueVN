import type { Action, VNEvent, Location } from '@generate/types';

export interface LocationData {
  id: string;
  info?: Location;
  actions: Record<string, Action>;
  events: Record<string, VNEvent>;
  // Optional: generated mapping from event key to relative path (without extension)
  eventsPaths?: Record<string, string>;
  accessibles: Record<string, Location>;
}
