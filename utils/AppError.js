class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperationl = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
