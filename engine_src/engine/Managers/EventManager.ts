import { gameState } from "@generate/stores";
import type { GameState, VNEvent } from '@generate/types';

interface EventLookup {
  immediateEvent: VNEvent | null;
  drawableEvents: VNEvent[];
}

interface EventCache {
  notReady: VNEvent[]; 
  unlocked: VNEvent[]; 
  locked: VNEvent[]
}

function isDrawingEvent(e: VNEvent): boolean {
  return e.draw != null;
}

export default class EventManager
{
  eventCache: Record<string, EventCache>;
  globalEvent: EventCache;
  eventById: Map<string, VNEvent>;

  constructor() {
    this.eventCache = {};
    this.eventById = new Map<string, VNEvent>();
  }

  resetEvents(gameState: GameState): void{
    this.initEventsCopy();
    this.updateEventsCache(gameState);
  }

  async getEvents(gameState: GameState): Promise<EventLookup> {
    const location = gameState.location_id;
    // Only check unlocked events - locked events are permanently excluded
    const locationEvents = this.eventCache[location];
    let eventList: VNEvent[] = [];
    if (locationEvents) {
      eventList = locationEvents.unlocked;
    }
    const drawableEvents: VNEvent[] = [];

    for (const event of eventList) {
      if (event.conditions(gameState)) {
        if (!isDrawingEvent(event)) {
          return { immediateEvent: event, drawableEvents: [] };
        } else {
          drawableEvents.push(event);
        }
      }
    }
    return { immediateEvent: null, drawableEvents };  
  }

  initEventsCopy(): void {
    this.eventCache = {};
    for (const location in eventIndex) {
      const list = eventIndex[location];      
      this.eventCache[location] = {
        notReady: [...list],
        unlocked: [],
        locked: [],
      };
      for (const event of list) {
        this.eventById.set(event.id, event);
      }
    }
  }

  updateEventsCache(gameState: GameState, location?: string): void {
    const locations = location ? [location] : Object.keys(this.eventCache);
    
    for (const loc of locations) {
      const cache = this.eventCache[loc];
      if (!cache) continue;
      
      // Move NotReady → Unlocked
      const stillNotReady: VNEvent[] = [];
      for (const event of cache.notReady) {
        if (event.unlocked(gameState)) {
          cache.unlocked.push(event);
        } else {
          stillNotReady.push(event);
        }
      }
      cache.notReady = stillNotReady;

      // Move Unlocked → Locked
      const stillUnlocked: VNEvent[] = [];
      for (const event of cache.unlocked) {
        if (event.locked(gameState)) {
          cache.locked.push(event);
        } else {
          stillUnlocked.push(event);
        }
      }
      cache.unlocked = stillUnlocked;

      // Locked events stay locked - no processing needed
    }
    
    console.log('Cache updated:', this.eventCache);
  }

  findEventById(eventId: string): VNEvent | undefined {
    return this.eventById.get(eventId);
  }
}

/*
const handleEvent = async (engine: Engine, event: VNEvent): Promise<void> => {
  console.debug("Executing immediate event:", event.id);
  try {
    await event.execute(engine, engine.gameState);
  } catch (err) {
    if (err instanceof VNInterruptError) {
      throw err;
    }
    const location = engine.gameState.location;
    const cache = engine.eventCache[location];
    if (cache) {
      cache.unlocked = cache.unlocked.filter((ev) => ev !== event);
      cache.locked.push(event);
    }
    window.alert(
      `An error occurred in event '${
        event.id
      }'.\nThis event will be skipped.\nPlease report this to the game creator.\n\nError: ${
        (err as Error).message
      }`,
    );
  }
};
*/