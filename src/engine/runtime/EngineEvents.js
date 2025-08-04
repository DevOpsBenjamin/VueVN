import { events as eventIndex } from '@/generate/events'; // Import generated event index (adjust path as needed)
import { VNInterruptError } from '@/generate/engine';

const handleImmediateEvent = async (engine, immediateEvent) => {
  console.debug('Executing immediate event:', immediateEvent.id);
  try {
    await immediateEvent.execute(engine, engine.gameState);
  } catch (err) {
    if (err instanceof VNInterruptError) {
      throw err;
    }
    // Lock the event so it won't run again
    const location = engine.gameState.location;
    const cache = engine.eventCache[location];
    if (cache) {
      // Remove from unlocked
      cache.unlocked = cache.unlocked.filter((ev) => ev !== immediateEvent);
      cache.locked.push(immediateEvent);
    }
    // Alert the user
    window.alert(
      `An error occurred in event '${
        immediateEvent.id
      }'.\nThis event will be skipped.\nPlease report this to the game creator.\n\nError: ${
        err && err.message ? err.message : err
      }`
    );
  }
};

/**
 * Create a deep copy of all events per location
 * This is used to reset the event cache when starting a new game
 */
const createEventsCopy = (engine) => {
  engine.eventCache = {};
  for (const location in eventIndex) {
    engine.eventCache[location] = {
      notReady: [...eventIndex[location]],
      unlocked: [],
      locked: [],
    };
  }
};

/**
 * calculate and return the events for the current location
 * @returns {Promise<{immediateEvent: object|null, drawableEvents: object[]}>}
 */
const getEvents = async (engine) => {
  console.debug('Loading events for location:', engine.gameState.location);
  const location = engine.gameState.location;
  const eventList = engine.eventCache[location].unlocked || [];
  console.debug(`Found ${eventList.length} events for location: ${location}`);
  const drawableEvents = [];
  for (const event of eventList) {
    if (
      typeof event.conditions === 'function' &&
      event.conditions(engine.gameState)
    ) {
      if (typeof event.draw !== 'function') {
        console.debug(`Event ${event.id} is immediate, executing directly`);
        return { immediateEvent: event, drawableEvents: [] };
      } else {
        drawableEvents.push(event);
      }
    }
  }
  // No immediate event, return all drawable events
  return { immediateEvent: null, drawableEvents };
};

//Engine events optimization to not re-check all events every time
const updateEvents = (engine, location) => {
  console.debug('Updating events for location:', location || 'all');

  // If location is provided, only update that location; else update all
  const locations = location ? [location] : Object.keys(engine.eventCache);
  for (const loc of locations) {
    const cache = engine.eventCache[loc];
    if (!cache) {
      continue;
    }
    const stillNotReady = [];
    for (const event of cache.notReady) {
      if (
        typeof event.locked === 'function' &&
        event.locked(engine.gameState)
      ) {
        cache.locked.push(event);
      } else if (
        typeof event.unlocked === 'function' &&
        event.unlocked(engine.gameState)
      ) {
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
        Not Ready: ${cache.notReady.length}`
    );
  }
};

export default {
  handleImmediateEvent,
  createEventsCopy,
  getEvents,
  updateEvents,
};
