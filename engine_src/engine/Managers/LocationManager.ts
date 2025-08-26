import projectData from '@generate/project';
import type { GameState, Location, LocationResources } from '@generate/types';

export default class LocationManager {
  locationDico: Record<string, Location> = {};
  private currentLocations: Record<string, Location> = {};
  private updateCallback: (() => void) | null = null;

	constructor() {
		this.buildLocationsRecords();
	}

	buildLocationsRecords() {
		for (const [location_id, location] of Object.entries(projectData.locations)) {
			this.locationDico[location_id] = location.info!;
		}
	}

	findById(location_id: string): Location {
		const loc = this.locationDico[location_id];
		if (!loc) {
			throw new Error(`[LocationManager] Unknown location id: "${location_id}"`);
		}
		return loc;
	}

  setUpdateCallback(callback: () => void): void {
    this.updateCallback = callback;
  }

  getAccessibleLocations(): Record<string, Location> {
    return this.currentLocations;
  }
	
  updateLocations(location_id: string): void {
    const loc = this.locationDico[location_id];
    this.currentLocations = {}
    for (const location in loc.accessibleLocations) {
      const currLocation = this.findById(location)
      if (currLocation != null) {
        this.currentLocations[location] = currLocation;
      }
    }

		if (this.updateCallback) {
		  this.updateCallback();
		}
	}
}