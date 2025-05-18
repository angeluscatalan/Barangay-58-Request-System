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
  if ([1, 2].includes(req.user?.access_level)) {
    return next();
  }
  res.status(403).json({ message: 'Admin privileges required' });
};



module.exports = { authenticateToken, authorizeAdmin };