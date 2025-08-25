import type { Action } from './Action';
import type { VNEvent } from './VNEvent';

export interface LocationInfo {
  name: string;
  description?: string;
  [key: string]: any;
}

export interface LocationData {
  id: string;
  info: LocationInfo;
  actions: Record<string, Action>;
  events: Record<string, VNEvent>;
}