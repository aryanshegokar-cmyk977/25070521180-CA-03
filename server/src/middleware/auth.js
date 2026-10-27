const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { httpError } = require('./error');

// Makes a login token that proves who the user is. It lasts 7 days.
function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Guard: only logged-in users get past this point.
// The client sends the token in a header: "Authorization: Bearer <token>".
async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw httpError(401, 'Please log in first');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Your session has expired, please log in again');
  }

  const user = await User.findById(payload.id);
  if (!user) throw httpError(401, 'Account no longer exists, please log in again');

  req.user = user; // available to every route after this
  next();
}

// Guard: only admins get past this point (use after "protect").
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') throw httpError(403, 'Admins only');
  next();
}

// Guard: reader features only (admins manage the shop, they don't buy or review).
function usersOnly(req, res, next) {
  if (req.user.role !== 'user') throw httpError(403, 'This feature is for readers only');
  next();
}

module.exports = { createToken, protect, adminOnly, usersOnly };
