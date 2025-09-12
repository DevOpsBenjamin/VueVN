import bedroom from '@generate/locations/bedroom';
import living_room from '@generate/locations/living_room';
import mother_room from '@generate/locations/mother_room';
import neighbor_entrance from '@generate/locations/neighbor_entrance';
import garden from '@generate/locations/garden';
import city from '@generate/locations/city';
import cafe from '@generate/locations/cafe';
import outside from '@generate/locations/outside';
import { LocationManager } from '@generate/engine';

/**
 * Location graph (undirected intent)
 *
 *         [Mother Room]
 *               |
 * [Bedroom]-[LivingRoom]-[Outside]--[Neighbor Entrance]
 *                         |   \
 *                     [Garden][City]--[Cafe]
 *
 * Zones
 *  - House: Bedroom, LivingRoom, Mother Room
 *  - Outside hub: Outside (connects house → neighborhood)
 *  - Neighborhood: Neighbor Entrance, City, Garden
 *  - City hub: City (connects to Cafe)
 *   (garden is in house but for this game we decide from hallway we can't go to garden directly must first get out of house)
 *
 * Edges (bidirectional intent)
 *  - Bedroom    <-> LivingRoom
 *  - LivingRoom <-> Mother Room
 *  - LivingRoom <-> Outside
 *  - Outside    <-> Neighbor Entrance
 *  - Outside    <-> Garden
 *  - Outside    <-> City
 *  - City       <-> Cafe
 *
 * Note: Calls below use star links around the hubs (Hallway, Outside).
 * If LocationManager.link() is one-way, we add the reverse where needed.
 */
class LocationLinker {
  static initLocationLinks(locationManager: LocationManager): void {
    //Interior
    // HUB
    locationManager.link(living_room, [bedroom, mother_room, outside]);
    // SIMPLE
    locationManager.link(bedroom, [living_room]);
    locationManager.link(mother_room, [living_room]);

    //Outside
    // HUB
    locationManager.link(outside, [living_room, neighbor_entrance, garden, city]);
    // SIMPLE
    locationManager.link(neighbor_entrance, [outside]);
    locationManager.link(garden, [outside]);

    //City
    // HUB
    locationManager.link(city, [outside, cafe]);
    // SIMPLE
    locationManager.link(cafe, [city]);
  }
}

export default LocationLinker;
