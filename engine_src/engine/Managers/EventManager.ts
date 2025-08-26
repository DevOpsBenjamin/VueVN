import type { GameState, VNEvent } from '@generate/types';
import projectData from '@generate/project'

interface EventLookup {
  immediateEvent: VNEvent | null;
  drawableEvents: VNEvent[];
}

interface EventCache {
  notReady: Record<string, VNEvent>; 
  unlocked: Record<string, VNEvent>; 
  locked: Record<string, VNEvent>;
}

function isDrawingEvent(e: VNEvent): boolean {
  return e.draw != null;
}

export default class EventManager
{
  eventCache: Record<string, EventCache>;
  globalCache: EventCache

  constructor() {
    this.eventCache = {};
    this.globalCache = { locked: {}, notReady: {}, unlocked: {} };
  }

  resetEvents(gameState: GameState): void{
    this.initEventsCopy();
    this.updateEventsCache(gameState);
  }

  initEventsCopy(): void {
    this.eventCache = {};
    for (const location_id in projectData.locations) {
      const list = projectData.locations[location_id].events;      
      this.eventCache[location_id] = {
        notReady: list,
        unlocked: {},
        locked: {},
      };
    }
    this.globalCache = {
      notReady: projectData.global.events,
      locked: {},
      unlocked: {}
    }
  }

  updateEventsCache(gameState: GameState, location?: string): void {
    const locations = location ? [location] : Object.keys(this.eventCache);
    
    for (const loc of locations) {
      const cache = this.eventCache[loc];
      if (!cache) {
        continue;
      }
      this.refreshCache(gameState, cache);
    }
    
    this.refreshCache(gameState, this.globalCache);
    console.log('Cache updated:', this.eventCache);
  }
  
  refreshCache(gameState: GameState, cache: EventCache): void {
    // Move NotReady → Unlocked
    const stillNotReady: Record<string, VNEvent> = {};
    for (const [eventId, event] of Object.entries(cache.notReady)) {
      if (event.unlocked(gameState)) {
        cache.unlocked[eventId] = event;
      } else {
        stillNotReady[eventId] = event;
      }
    }
    cache.notReady = stillNotReady;

    // Move Unlocked → Locked
    const stillUnlocked: Record<string, VNEvent> = {};
    for (const [eventId, event] of Object.entries(cache.unlocked)) {
      if (event.locked(gameState)) {
        cache.locked[eventId] = event;
      } else {
        stillUnlocked[eventId] = event;
      }
    }
    cache.unlocked = stillUnlocked;

    // Locked events stay locked - no processing needed
  }
  
  async getEvents(gameState: GameState): Promise<EventLookup> {
    const location = gameState.location_id;
    const drawableEvents: VNEvent[] = [];

    // Get location-specific unlocked events
    const locationEvents = this.eventCache[location];
    let locationEventList: VNEvent[] = [];
    if (locationEvents) {
      locationEventList = Object.values(locationEvents.unlocked);
    }

    // Get global unlocked events (always available)
    const globalEventList: VNEvent[] = Object.values(this.globalCache.unlocked);

    // Combine location and global events
    const allEvents = [...locationEventList, ...globalEventList];

    // Process all events
    for (const event of allEvents) {
      if (event.conditions(gameState)) {
        if (!isDrawingEvent(event)) {
          // Immediate event found - return it with empty drawableEvents
          return { immediateEvent: event, drawableEvents: [] };
        } else {
          drawableEvents.push(event);
        }
      }
    }
    
    // No immediate events found, return drawable events
    return { immediateEvent: null, drawableEvents };  
  }
}