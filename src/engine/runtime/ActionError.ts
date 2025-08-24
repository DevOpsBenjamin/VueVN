export default class ActionError extends Error {
  constructor(message: string = 'Action already set') {
    super(message);
    this.name = 'ActionError';
  }
}