class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = 'NotFoundError';
    this.errorMessage = message;
    Error.captureStackTrace(this, NotFoundError);
  }
}

export default NotFoundError;
