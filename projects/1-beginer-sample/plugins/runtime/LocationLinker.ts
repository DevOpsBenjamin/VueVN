import { bedroom, hallway, mother_bedroom, neighbor_entrance, garden, city, home_outside } from '@/generate/locations';

class LocationLinker {
    static  initLocationLinks()
    {
        // Inside house: bedroom <-> hallway <-> mother_bedroom
        bedroom.accessibleLocations = [hallway];
        hallway.accessibleLocations = [bedroom, mother_bedroom, home_outside];
        mother_bedroom.accessibleLocations = [hallway];
        home_outside.accessibleLocations = [hallway, neighbor_entrance, garden, city];
        neighbor_entrance.accessibleLocations = [home_outside];
        garden.accessibleLocations = [home_outside];
        city.accessibleLocations = [home_outside];
    }
}

export default LocationLinker;