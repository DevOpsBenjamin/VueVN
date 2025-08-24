/**
 * Thrown when an event execution should be interrupted (e.g., jump to new event)
 */
export class JumpInterrupt extends Error {
  constructor(public targetEventId?: string) {
    super(`Jump interrupt${targetEventId ? ` to ${targetEventId}` : ''}`);
    this.name = 'JumpInterrupt';
  }
}

/**
 * Thrown when a VN operation is interrupted (e.g., menu navigation)
 */
export class VNInterruptError extends Error {
  constructor(message: string = 'VN operation interrupted') {
    super(message);
    this.name = 'VNInterruptError';
  }
}

export default { JumpInterrupt, VNInterruptError };