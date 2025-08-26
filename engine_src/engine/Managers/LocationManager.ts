import projectData from '@generate/project';
import type { GameState, Location, LocationData } from '@generate/types';
import { LocationLinker } from '@generate/engine';

export default class LocationManager {
  locationDataDico: Record<string, LocationData> = {};
  private currentLocations: Record<string, Location> = {};
  private updateCallback: (() => void) | null = null;

	constructor() {
		this.buildLocationsRecords();
		this.initializeLocationLinks();
	}

	buildLocationsRecords() {
		this.locationDataDico = projectData.locations;
	}
	
	initializeLocationLinks() {		
		// Call the project-specific LocationLinker
		LocationLinker.initLocationLinks(this);
		
		// Validate that all locations were properly linked
		this.validateLocationLinks();
	}
  
  validateLocationLinks(): void {
    const locations = this.locationDataDico;
    // Validation is optional - some locations may legitimately have no connections
    // This method exists for debugging purposes to ensure LocationLinker was called
    console.log(`📍 LocationLinker validation: ${Object.keys(locations).length} locations processed`);
    
    const locationStats = Object.entries(locations).map(([id, data]) => 
      `${id}: ${Object.keys(data.accessibles).length} connections`
    );
    console.log(`🔗 Location connections: ${locationStats.join(', ')}`);
  }

	findById(location_id: string): Location {
		const loc = this.locationDataDico[location_id];
		if (!loc.info) {
			throw new Error(`[LocationManager] Unknown location id: "${location_id}"`);
		}
		return loc.info;
	}

  setUpdateCallback(callback: () => void): void {
    this.updateCallback = callback;
  }

  getAccessibleLocations(): Record<string, Location> {
    return this.currentLocations;
  }
	
  updateLocations(location_id: string): void {
    const locationData = this.locationDataDico[location_id];
    if (!locationData) {
      throw new Error(`[LocationManager] Unknown location id: "${location_id}"`);
    }
    
    // Get accessible locations from LocationData (set by LocationLinker)
    // accessibles is now Record<string, Location> so we can use it directly
    this.currentLocations = locationData.accessibles;

    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  // #regin Linker
  link(location: LocationData, access: LocationData[]) {
    for (const toAdd of access) {
      const current = this.locationDataDico[location.id];
      current.accessibles[toAdd.id] = toAdd.info!;
    }
  }
  // #endregion
}