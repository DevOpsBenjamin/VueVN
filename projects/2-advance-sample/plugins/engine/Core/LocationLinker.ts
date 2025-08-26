import type { LocationData } from '@generate/types';
import bedroom from '@generate/locations/bedroom';
import hallway from '@generate/locations/hallway';
import mother_room from '@generate/locations/mother_room';
import neighbor_entrance from '@generate/locations/neighbor_entrance';
import garden from '@generate/locations/garden';
import city from '@generate/locations/city';
import outside from '@generate/locations/outside';

/**
 * Complex LocationLinker implementation for 2-advance-sample
 * Demonstrates advanced location connectivity with house layout and neighborhood
 */
class LocationLinker {
  static initLocationLinks(locations: Record<string, LocationData>): void {
    // Complex house layout with neighborhood
    // Inside house: bedroom <-> hallway <-> mother_room
    // Outside: hallway <-> outside <-> (neighbor_entrance, garden, city)
    
    // Interior connections
    locations[bedroom.id].accessibles = { [hallway.id]: hallway.info! };
    locations[hallway.id].accessibles = { 
      [bedroom.id]: bedroom.info!,
      [mother_room.id]: mother_room.info!,
      [outside.id]: outside.info!
    };
    locations[mother_room.id].accessibles = { [hallway.id]: hallway.info! };
    
    // Exterior connections
    locations[outside.id].accessibles = {
      [hallway.id]: hallway.info!,
      [neighbor_entrance.id]: neighbor_entrance.info!,
      [garden.id]: garden.info!,
      [city.id]: city.info!
    };
    locations[neighbor_entrance.id].accessibles = { [outside.id]: outside.info! };
    locations[garden.id].accessibles = { [outside.id]: outside.info! };
    locations[city.id].accessibles = { [outside.id]: outside.info! };
  }
}

export default LocationLinker;