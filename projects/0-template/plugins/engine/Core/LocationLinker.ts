import type { LocationData } from '@generate/types';
import bedroom from '@generate/locations/bedroom';

/**
 * Minimal LocationLinker implementation for 0-template
 * Only has bedroom with no connections (single location)
 */
class LocationLinker {
  static initLocationLinks(locations: Record<string, LocationData>): void {
    // Template has only bedroom with no connections
    locations[bedroom.id].accessibles = {};
  }
}

export default LocationLinker;