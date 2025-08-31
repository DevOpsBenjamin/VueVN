// Custom error for VN event interruption
export default class VNInterruptError extends Error {
  constructor(message = "VN event interrupted") {
    super(message);
    this.name = "VNInterruptError";
  }
}
