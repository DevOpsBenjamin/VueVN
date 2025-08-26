import type { LocationData } from '@generate/types';
import bedroom from '@generate/locations/bedroom';
import hallway from '@generate/locations/hallway';
import city from '@generate/locations/city';
import mother_room from '@generate/locations/mother_room';
import outside from '@generate/locations/outside';

/**
 * Simple LocationLinker implementation for 1-beginer-sample
 * Demonstrates basic location connectivity
 */
class LocationLinker {
  static initLocationLinks(locations: Record<string, LocationData>): void {
    // Simple house layout: bedroom -> hallway -> outside
    // Plus individual access to other locations from outside
    
    locations[bedroom.id].accessibles = { [hallway.id]: hallway.info! };
    locations[hallway.id].accessibles = { 
      [bedroom.id]: bedroom.info!,
      [mother_room.id]: mother_room.info!,
      [outside.id]: outside.info!
    };
    locations[mother_room.id].accessibles = { [hallway.id]: hallway.info! };
    locations[outside.id].accessibles = {
      [hallway.id]: hallway.info!,
      [city.id]: city.info!
    };
    locations[city.id].accessibles = { [outside.id]: outside.info! };
  }
}

export default LocationLinker;