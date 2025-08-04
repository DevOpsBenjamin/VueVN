// Custom error for VN event interruption
class VNInterruptError extends Error {
  constructor(message = 'VN event interrupted') {
    super(message);
    this.name = 'VNInterruptError';
  }
}

export default VNInterruptError;
