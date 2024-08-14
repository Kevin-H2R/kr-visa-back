const jwt = require('jsonwebtoken');

// Middleware function to check for a valid JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(err)
      return res.sendStatus(403); // Forbidden
    }
    req.user = user; // Attach the decoded user information to the request
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;
