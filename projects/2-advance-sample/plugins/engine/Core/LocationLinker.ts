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
 * Location graph (undirected intent)
 *
 *         [Mother Room]
 *               |
 * [Bedroom]-[Hallway]-[Outside]--[Neighbor Entrance]
 *                         |   \
 *                     [Garden][City]
 *
 * Zones
 *  - House: Bedroom, Hallway, Mother Room
 *  - Outside hub: Outside (connects house → neighborhood)
 *  - Neighborhood: Neighbor Entrance, City,  Garden
 *   (garden is in house but for this game we decide from hallway we can't go to garden directly must first get out of house)
 *
 * Edges (bidirectional intent)
 *  - Bedroom  <-> Hallway
 *  - Hallway  <-> Mother Room
 *  - Hallway  <-> Outside
 *  - Outside  <-> Neighbor Entrance
 *  - Outside  <-> Garden
 *  - Outside  <-> City
 *
 * Note: Calls below use star links around the hubs (Hallway, Outside).
 * If LocationManager.link() is one-way, we add the reverse where needed.
 */
class LocationLinker {
  static initLocationLinks(locationManager: LocationManager): void {    
    //Interior
    // HUB
    locationManager.link(hallway, [bedroom, mother_room, outside]);
    // SIMPLE
    locationManager.link(bedroom, [hallway]);
    locationManager.link(mother_room, [hallway]);

    //Outside
    // HUB
    locationManager.link(outside, [hallway, neighbor_entrance, garden, city]);
    // SIMPLE
    locationManager.link(neighbor_entrance, [outside]);
    locationManager.link(garden, [outside]);
    locationManager.link(city, [outside]);
  }
}

export default LocationLinker;