const AppError = require("../utils/AppError");

// Cast Error (mongoose)
const handleCastError = function (err) {
  return new AppError(400, "Invalid Id.There is no resource");
};

// Duplicate Fields Eror(mongoose)
const handleDuplicateField = function (err) {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(400, message);
};

// Validation Errors (mongoose)
const handleValidationError = function (err) {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = errors.join(", ");
  return new AppError(400, message);
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === "CastError") err = handleCastError(err);
  if (err.code === 11000) err = handleDuplicateField(err);
  if (err.name === "ValidationError") err = handleValidationError(err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    err,
  });
};

module.exports = globalErrorHandler;
