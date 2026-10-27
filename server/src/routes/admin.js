const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const Purchase = require('../models/Purchase');
const Review = require('../models/Review');
const Voucher = require('../models/Voucher');
const { protect, adminOnly } = require('../middleware/auth');
const { httpError } = require('../middleware/error');

const router = express.Router();

router.use(protect, adminOnly);

// GET /api/admin/stats  - numbers for the Admin Dashboard
router.get('/stats', async (req, res) => {
  const [users, books, booksSold, reviews, voucherTotals, recentPurchases] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Book.countDocuments(),
    Purchase.countDocuments(),
    Review.countDocuments(),
    Voucher.aggregate([{ $group: { _id: null, uses: { $sum: '$usedCount' }, count: { $sum: 1 } } }]),
    Purchase.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('user', 'name email')
      .populate('book', 'title coverColor genre'),
  ]);

  res.json({
    users,
    books,
    booksSold,
    reviews,
    vouchers: voucherTotals[0]?.count || 0,
    voucherUses: voucherTotals[0]?.uses || 0,
    recentPurchases: recentPurchases.filter((p) => p.user && p.book),
  });
});

// GET /api/admin/users  - all reader accounts, with how many books and reviews each has
router.get('/users', async (req, res) => {
  const [users, owned, reviewed] = await Promise.all([
    User.find({ role: 'user' }).sort({ createdAt: -1 }),
    Purchase.aggregate([{ $group: { _id: '$user', n: { $sum: 1 } } }]),
    Review.aggregate([{ $group: { _id: '$user', n: { $sum: 1 } } }]),
  ]);
  const ownedMap = Object.fromEntries(owned.map((o) => [o._id.toString(), o.n]));
  const reviewMap = Object.fromEntries(reviewed.map((r) => [r._id.toString(), r.n]));

  res.json(
    users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      ownedCount: ownedMap[u._id.toString()] || 0,
      reviewCount: reviewMap[u._id.toString()] || 0,
    }))
  );
});

// DELETE /api/admin/users/:id  - delete a reader account with its library and reviews
router.delete('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found');
  if (user.role === 'admin') throw httpError(400, 'Admin accounts cannot be deleted here');

  await Purchase.deleteMany({ user: user._id });
  await Review.deleteMany({ user: user._id });
  await user.deleteOne();
  res.json({ message: `Deleted ${user.name} (${user.email})` });
});

module.exports = router;
