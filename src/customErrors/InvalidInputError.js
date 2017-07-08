class InvalidInputError extends Error {
  constructor(message) {
    super(message);
    this.code = 'InvalidInputError';
    this.errorMessage = message;
    Error.captureStackTrace(this, InvalidInputError);
  }
}

export default InvalidInputError;
