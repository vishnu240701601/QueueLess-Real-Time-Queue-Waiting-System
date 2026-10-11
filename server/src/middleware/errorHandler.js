// =====================================================================
// QueueLess – Centralized Error Handler Middleware
// Formats uniform JSON errors without leaking sensitive stack traces
// =====================================================================

function errorHandler(err, req, res, next) {
  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    error: err.code || err.name || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred while processing your request.',
    ...(isProduction ? {} : { stack: err.stack })
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'ENDPOINT_NOT_FOUND',
    message: `API endpoint '${req.method} ${req.originalUrl}' does not exist.`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
