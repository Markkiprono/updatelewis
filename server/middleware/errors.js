class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Express 4 does not catch rejected promises; this forwards them to the error handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const notFound = (req, _res, next) =>
  next(new HttpError(404, `Not found: ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || "Something went wrong";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  } else if (err.code === 11000) {
    status = 409;
    message = "That email is already registered";
  } else if (err.name === "MulterError") {
    status = 400;
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ message });
};

module.exports = { HttpError, asyncHandler, notFound, errorHandler };
