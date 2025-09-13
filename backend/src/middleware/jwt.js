const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error('JWT Middleware: No token provided. Headers:', req.headers);
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT Middleware: Decoded token:', decoded);
  // Support both _id and id for userId
  req.user = { ...decoded, _id: decoded._id || decoded.id };
    next();
  } catch (err) {
    console.error('JWT Middleware: Invalid token.', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { jwtMiddleware };
