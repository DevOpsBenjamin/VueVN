// Custom error for EventEnd Forcing after choice and jump.
export default class EventEndError extends Error {
  constructor(message = "EventId NOT SET") {
    super(message);
    this.name = "EventEndError";
  }
}
