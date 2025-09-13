const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { jwtMiddleware } = require('../middleware/jwt');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'User not found' });
  const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
});

router.get('/me', jwtMiddleware, async (req, res) => {
  res.json(req.user);
});

router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out' });
});

module.exports = router;
