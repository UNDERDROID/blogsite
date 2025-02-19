const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract Bearer token

  if (!token) return res.status(401).json({ error: 'No token provided' });

  // Verify JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user; // Set req.user
    next(); // Proceed to the next middleware or route
  });
};

module.exports = authenticateToken;
