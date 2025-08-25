import { LocationLinker } from '@generate/engine';
import type { GameState, Location, LocationResources } from '@generate/types';
import * as locations from '@generate/locations';

export default class LocationManager {
    locationDico: Record<string, Location> = {};
    private locationResourcesCache = new Map<string, LocationResources>();

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

    /**
     * Load resources for a specific location (actions, events, assets).
     * Resources are cached after first load for performance.
     */
    async loadLocationResources(locationId: string): Promise<LocationResources> {
        if (this.locationResourcesCache.has(locationId)) {
            return this.locationResourcesCache.get(locationId)!;
        }

        try {
            // Try new location-centric structure first
            const locationResources = await import(`@/generate/locations/${locationId}`);
            const resources = locationResources.locationResources;
            this.locationResourcesCache.set(locationId, resources);
            return resources;
        } catch (error) {
            console.warn(`[LocationManager] Could not load resources for location "${locationId}", using fallback empty resources`);
            // Fallback to empty resources
            const emptyResources: LocationResources = {
                actions: [],
                events: {},
                assets: { backgrounds: {}, objects: {}, characters: {} }
            };
            this.locationResourcesCache.set(locationId, emptyResources);
            return emptyResources;
        }
    }

    /**
     * Get actions available in the current location.
     */
    async getCurrentLocationActions(currentLocationId: string): Promise<import('@/generate/types').Action[]> {
        const resources = await this.loadLocationResources(currentLocationId);
        return resources.actions;
    }

    /**
     * Get events available in the current location.
     */
    async getCurrentLocationEvents(currentLocationId: string): Promise<Record<string, import('@/generate/types').VNEvent>> {
        const resources = await this.loadLocationResources(currentLocationId);
        return resources.events;
    }

    /**
     * Clear resource cache (useful for development/hot-reload).
     */
    clearResourceCache(): void {
        this.locationResourcesCache.clear();
    }
}