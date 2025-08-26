import type { LocationData } from '@generate/types';
import bedroom from '@generate/locations/bedroom';
import hallway from '@generate/locations/hallway';
import mother_room from '@generate/locations/mother_room';
import neighbor_entrance from '@generate/locations/neighbor_entrance';
import garden from '@generate/locations/garden';
import city from '@generate/locations/city';
import outside from '@generate/locations/outside';
import { LocationManager } from '@generate/engine';

/**
 * Complex LocationLinker implementation for 2-advance-sample
 * Demonstrates advanced location connectivity with house layout and neighborhood
 */
class LocationLinker {
  static initLocationLinks(locationManager: LocationManager): void {
    // Complex house layout with neighborhood
    // Inside house: bedroom <-> hallway <-> mother_room
    // Outside: hallway <-> outside <-> (neighbor_entrance, garden, city)
    
    //Interior
    locationManager.link(bedroom, [hallway]);
    locationManager.link(hallway, [bedroom, mother_room, outside]);
    locationManager.link(mother_room, [hallway]);

    //Outside
    locationManager.link(outside, [hallway, neighbor_entrance, garden, city]);
    locationManager.link(neighbor_entrance, [outside]);
    locationManager.link(garden, [outside]);
    locationManager.link(city, [outside]);
  }
}

export default LocationLinker;