const express = require('express');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const { createToken, protect } = require('../middleware/auth');
const { httpError } = require('../middleware/error');

const router = express.Router();

// The user info we send back (never the password).
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}

// POST /api/auth/register  - sign up (always as a normal user)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) throw httpError(400, 'Please fill in name, email and password');

  const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (exists) throw httpError(400, 'An account with this email already exists');

  const user = await User.create({ name, email, password, role: 'user' });
  res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

// POST /api/auth/login  - log in with email + password
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw httpError(400, 'Please enter your email and password');

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !(await user.checkPassword(password))) {
    throw httpError(401, 'Wrong email or password');
  }
  res.json({ token: createToken(user), user: publicUser(user) });
});

// GET /api/auth/me  - who am I? (+ how many books I own, for the Profile page)
router.get('/me', protect, async (req, res) => {
  const ownedCount = await Purchase.countDocuments({ user: req.user._id });
  res.json({ user: publicUser(req.user), ownedCount });
});

// PUT /api/auth/me  - change my name
router.put('/me', protect, async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) throw httpError(400, 'Name cannot be empty');
  req.user.name = name;
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});

// PUT /api/auth/me/password  - change my password
router.put('/me/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) throw httpError(400, 'Please fill in both password fields');

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.checkPassword(currentPassword))) throw httpError(400, 'Current password is wrong');

  user.password = newPassword; // hashed automatically by the User model
  await user.save();
  res.json({ message: 'Password changed' });
});

module.exports = router;
