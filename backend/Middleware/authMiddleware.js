const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: "Authorization token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    
    req.user = user;
    next();
  });
};



exports.authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    console.log('No user in request');
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log('User access level:', req.user.access_level);
  
  // Check for admin (1) or superadmin (2) access level
  if (req.user.access_level === 1 || req.user.access_level === 2) {
    return next();
  }

  console.log('Access denied for user:', req.user.username);
  res.status(403).json({ 
    message: 'Admin privileges required',
    userAccessLevel: req.user.access_level,
    requiredAccessLevel: '1 (admin) or 2 (superadmin)'
  });
};

exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

exports.ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
}

