import type { Action } from './Action';
import type { VNEvent } from './VNEvent';

export interface LocationAssets {
  backgrounds: Record<string, string>;
  objects: Record<string, string>;
  characters: Record<string, string>;
}

export interface LocationResources {
  actions: Action[];
  events: Record<string, VNEvent>;
  assets: LocationAssets;
}

export interface GlobalResources {
  events: Record<string, VNEvent>;
  assets: {
    ui: Record<string, string>;
    characters: Record<string, string>;
    overlays: Record<string, string>;
  };
}

export interface LocationRegistry {
  locations: Record<string, LocationResources>;
  global: GlobalResources;
}