export default class NavigationCancelledError extends Error {
  constructor(message: string = 'Navigation cancelled') {
    super(message);
    this.name = 'NavigationCancelledError';
  }
}