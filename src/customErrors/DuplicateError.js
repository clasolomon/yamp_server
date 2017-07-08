class DuplicateError extends Error {
  constructor(message) {
    super(message);
    this.code = 'DuplicateError';
    this.errorMessage = message;
    Error.captureStackTrace(this, DuplicateError);
  }
}

export default DuplicateError;
