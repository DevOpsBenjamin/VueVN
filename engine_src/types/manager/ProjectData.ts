
import type { GameConfig, LocationData } from '@generate/types';

export interface ProjectData {
  project_id: string;
  config: GameConfig;
  locations: Record<string, LocationData>;
  global: LocationData;
}