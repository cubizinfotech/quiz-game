const { verifyToken } = require('../config/jwt');

// Optional middleware — sets req.user if a valid user JWT is present, null otherwise.
// Never rejects the request; all quiz routes remain publicly accessible.
const userAuth = (req, res, next) => {
  req.user = null;
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    if (decoded.role === 'user') req.user = decoded;
  } catch {
    // Invalid or expired token — just leave req.user as null
  }
  next();
};

module.exports = userAuth;
