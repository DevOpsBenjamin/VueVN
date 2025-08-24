import { bedroom, hallway, mother_bedroom } from '@/generate/locations';

class LocationLinker {
    static  initLocationLinks()
    {
        bedroom.accessibleLocations = [hallway];
        hallway.accessibleLocations = [bedroom, mother_bedroom];
        mother_bedroom.accessibleLocations = [hallway];
    }
}

export default LocationLinker;