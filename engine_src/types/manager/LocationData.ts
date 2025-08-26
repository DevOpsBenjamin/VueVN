import type { Action, VNEvent, Location } from '@generate/types';

export interface LocationData {
  id: string;
  info?: Location;
  actions: Record<string, Action>;
  events: Record<string, VNEvent>;
}