const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401); // 401 for missing token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // 403 for invalid/expired token
    req.user = user; // Attach decoded user to request
    next();
  });
};




const authorizeAdmin = (req, res, next) => {
  if (!req.user) return res.sendStatus(401);
  
  // Either use access_level or role, but not both
  if ([1, 2].includes(req.user.access_level)) { // or req.user.role === 'admin'
    return next();
  }
  res.status(403).json({ 
    message: 'Admin privileges required',
    errorCode: 'FORBIDDEN_ADMIN_ACCESS' // Standardized error code
  });
};

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

function ensureAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
}

module.exports = { authenticateToken, authorizeAdmin, ensureAuthenticated, ensureAdmin };