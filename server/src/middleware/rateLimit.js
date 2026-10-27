const rateLimit = require('express-rate-limit');

// Stops someone from guessing passwords or voucher codes over and over.
// Only FAILED attempts count, so normal users never notice it.
function limitFailures({ max, message, keyGenerator }) {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: max,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message },
    ...(keyGenerator && { keyGenerator }),
    // The automated tests make lots of wrong attempts on purpose.
    skip: () => process.env.NODE_ENV === 'test',
  });
}

// Per computer (IP address): 10 wrong logins per 15 minutes.
const loginLimiter = limitFailures({
  max: 10,
  message: 'Too many failed login attempts. Please wait 15 minutes and try again.',
});

// Per account: 10 wrong voucher codes per 15 minutes.
const voucherLimiter = limitFailures({
  max: 10,
  message: 'Too many wrong voucher codes. Please wait 15 minutes and try again.',
  keyGenerator: (req) => req.user._id.toString(),
});

module.exports = { loginLimiter, voucherLimiter };
