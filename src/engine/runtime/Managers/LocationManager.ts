import { LocationLinker } from '@/generate/runtime';
import type { GameState, Location } from '@/generate/types';
import * as locations from '@/generate/locations';

export default class LocationManager {
    locationDico: Record<string, Location> = {};

    constructor() {
        this.buildLocationsRecords();
        LocationLinker.initLocationLinks();
    }
    
    buildLocationsRecords() {
        this.locationDico = {};
        for (const location in locations) {
            try {
              const current = (locations as any)[location] as Location;
              this.locationDico[current.id] = current;
            }
            catch (e) {
                console.warn(`Invalid location: ${location}`, e);
            }
        }
    }

    findLocationById(location_id: string): Location {
        const loc = this.locationDico[location_id];        
        if (!loc) {
            throw new Error(`[LocationManager] Unknown location id: "${location_id}"`);
        }
        return loc;
    }
}