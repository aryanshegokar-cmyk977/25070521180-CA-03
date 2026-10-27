// Runs when no route matched the URL.
function notFound(req, res) {
  res.status(404).json({ message: `Not found: ${req.originalUrl}` });
}

// Catches every error thrown inside a route and turns it into a friendly JSON reply.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // A badly formed id, e.g. /api/books/123
  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Item not found' });
  }
  // A required field is missing or a value is not allowed
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  // A "unique" field already exists, e.g. email or voucher code
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    return res.status(400).json({ message: `That ${field} is already taken` });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: err.message || 'Something went wrong on the server' });
}

// Helper to throw an error with an HTTP status code, e.g. throw httpError(400, 'Bad input')
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { notFound, errorHandler, httpError };
