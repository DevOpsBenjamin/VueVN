
import type { LocationData } from '@generate/types';

export interface ProjectData {
  project_id: string;
  locations: Record<string, LocationData>;
  global: LocationData;
}