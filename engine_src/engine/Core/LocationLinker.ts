import type { LocationData } from '@generate/types';

/**
 * Base LocationLinker class - must be overridden in projects
 * Handles setting up accessibility between locations in a strongly typed way
 */
export abstract class LocationLinker {
  /**
   * Abstract method to initialize location links
   * Projects must implement this to define which locations connect to which
   * This is called by LocationManager after all locations are loaded
   * 
   * @param locations - Map of all location data keyed by location ID
   */
  static initLocationLinks(locations: Record<string, LocationData>): void {
    throw new Error(
      'LocationLinker.initLocationLinks must be implemented in project plugins/engine/Core/LocationLinker.ts'
    );
  }
}