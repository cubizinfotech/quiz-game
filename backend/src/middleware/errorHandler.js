const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path} —`, err.message);

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
