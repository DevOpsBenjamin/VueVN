import type { VNAction, VNEvent, Location } from '@generate/types';

export interface LocationData {
  id: string;
  info?: Location;
  actions: Record<string, VNAction>;
  events: Record<string, VNEvent>;
  // Optional: generated mapping from event key to relative path (without extension)
  actionsPaths?: Record<string, string>;
  eventsPaths?: Record<string, string>;
  accessibles: Record<string, Location>;
}
