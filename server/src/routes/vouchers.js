const express = require('express');
const Voucher = require('../models/Voucher');
const { protect, adminOnly } = require('../middleware/auth');
const { httpError } = require('../middleware/error');

const router = express.Router();

// Every voucher route is admin only.
router.use(protect, adminOnly);

// Fields an admin is allowed to set on a voucher.
function pickVoucherFields(body = {}) {
  const data = {};
  if (body.code !== undefined) data.code = body.code;
  if (body.description !== undefined) data.description = body.description;
  if (body.maxUses !== undefined) data.maxUses = Number(body.maxUses);
  if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt || null; // empty = never expires
  return data;
}

// Adds a readable status for the Admin Panel: Active / Expired / Used up.
function withStatus(voucher) {
  const v = voucher.toObject();
  let status = 'Active';
  if (v.expiresAt && v.expiresAt < new Date()) status = 'Expired';
  else if (v.usedCount >= v.maxUses) status = 'Used up';
  delete v.usedBy; // the admin list only needs the count
  return { ...v, status };
}

// GET /api/vouchers  - list all vouchers
router.get('/', async (req, res) => {
  const vouchers = await Voucher.find().sort({ createdAt: -1 });
  res.json(vouchers.map(withStatus));
});

// POST /api/vouchers  - create a voucher
router.post('/', async (req, res) => {
  const voucher = await Voucher.create(pickVoucherFields(req.body));
  res.status(201).json(withStatus(voucher));
});

// PUT /api/vouchers/:id  - update a voucher
router.put('/:id', async (req, res) => {
  const voucher = await Voucher.findById(req.params.id);
  if (!voucher) throw httpError(404, 'Voucher not found');
  voucher.set(pickVoucherFields(req.body));
  await voucher.save();
  res.json(withStatus(voucher));
});

// DELETE /api/vouchers/:id  - delete a voucher
router.delete('/:id', async (req, res) => {
  const voucher = await Voucher.findByIdAndDelete(req.params.id);
  if (!voucher) throw httpError(404, 'Voucher not found');
  res.json({ message: `Deleted voucher ${voucher.code}` });
});

module.exports = router;
