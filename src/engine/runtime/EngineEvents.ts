import { events as eventIndex } from "@/generate/events";
import { VNInterruptError } from "@/generate/runtime";
import type { Engine } from '@/generate/runtime';
import type { VNEvent } from '@/generate/runtime';

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

const createEventsCopy = (engine: Engine): void => {
  engine.eventCache = {} as any;
  for (const location in eventIndex) {
    engine.eventCache[location] = {
      notReady: [...eventIndex[location]],
      unlocked: [],
      locked: [],
    };
  }
};

export interface EventLookup {
  immediateEvent: VNEvent | null;
  drawableEvents: VNEvent[];
}

const getEvents = async (engine: Engine): Promise<EventLookup> => {
  console.debug("Loading events for location:", engine.gameState.location);
  const location = engine.gameState.location;
  const eventList = engine.eventCache[location].unlocked || [];
  console.debug(`Found ${eventList.length} events for location: ${location}`);
  const drawableEvents: VNEvent[] = [];
  for (const event of eventList) {
    if (
      typeof event.conditions === "function" &&
      event.conditions(engine.gameState)
    ) {
      if (typeof event.draw !== "function") {
        console.debug(`Event ${event.id} is immediate, executing directly`);
        return { immediateEvent: event, drawableEvents: [] };
      } else {
        drawableEvents.push(event);
      }
    }
  }
  return { immediateEvent: null, drawableEvents };
};

const updateEvents = (engine: Engine, location?: string): void => {
  console.debug("Updating events for location:", location || "all");
  const locations = location ? [location] : Object.keys(engine.eventCache);
  for (const loc of locations) {
    const cache = engine.eventCache[loc];
    if (!cache) {
      continue;
    }
    const stillNotReady: VNEvent[] = [];
    for (const event of cache.notReady as VNEvent[]) {
      if (event.locked && event.locked(engine.gameState)) {
        cache.locked.push(event);
      } else if (event.unlocked && event.unlocked(engine.gameState)) {
        cache.unlocked.push(event);
      } else {
        stillNotReady.push(event);
      }
    }
    cache.notReady = stillNotReady;
    console.debug(
      `Events updated for location:${loc},
        Unlocked: ${cache.unlocked.length},
        Locked: ${cache.locked.length},
        Not Ready: ${cache.notReady.length}`,
    );
  }
};

export default {
  handleEvent,
  createEventsCopy,
  getEvents,
  updateEvents,
};
