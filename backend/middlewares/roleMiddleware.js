const jwt = require('jsonwebtoken');

const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret key
      const userRole = decoded.role;
      req.user=decoded;

      // Allow access if user has the required role or is an admin
      if (userRole === requiredRole || userRole === 'admin') {
        next();
      } else {
        res.status(403).json({ error: 'Forbidden' });
      }
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

module.exports = { authorizeRole };
