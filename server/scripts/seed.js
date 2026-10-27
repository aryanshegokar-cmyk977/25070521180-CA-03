// Fills the database with starter data.
//   npm run seed    -> add/update books, admin and vouchers. Keeps users, purchases and reviews.
//   npm run reset   -> WIPES the whole database first, then seeds fresh.
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Book = require('../src/models/Book');
const User = require('../src/models/User');
const Voucher = require('../src/models/Voucher');
const { loadBooks } = require('./loadBooks');

const VOUCHERS = [
  { code: 'WELCOME50', description: 'Welcome offer: 50 uses', maxUses: 50, expiresAt: null },
  { code: 'FREEBOOK', description: 'One free book (single use)', maxUses: 1, expiresAt: null },
  { code: 'EXAM2026', description: 'Exam season code', maxUses: 100, expiresAt: new Date('2026-12-31T23:59:59') },
  { code: 'OLDCODE', description: 'Already expired (for testing)', maxUses: 100, expiresAt: new Date('2025-01-01T00:00:00') },
];

async function seed() {
  const books = loadBooks(); // read files first, so a mistake stops us before touching the database
  await connectDB();

  if (process.argv.includes('--reset')) {
    await mongoose.connection.dropDatabase();
    console.log('Database wiped.');
  }

  // Books: matched by "slug", so re-seeding updates them in place
  // and existing purchases/reviews keep working.
  for (const { details, chapters } of books) {
    await Book.findOneAndUpdate(
      { slug: details.slug },
      { ...details, chapters },
      { upsert: true, runValidators: true }
    );
    console.log(`Book saved: ${details.title} (${chapters.length} chapters)`);
  }

  // Admin account (password is reset to the one in .env every time you seed).
  const email = (process.env.ADMIN_EMAIL || 'admin@bookverse.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  let admin = await User.findOne({ email });
  if (!admin) admin = new User({ name: 'Admin', email });
  admin.role = 'admin';
  admin.password = password;
  await admin.save();
  console.log(`Admin ready: ${email} / ${password}`);

  // Vouchers: only added if missing, so their usage counts are not reset.
  for (const voucher of VOUCHERS) {
    const exists = await Voucher.exists({ code: voucher.code });
    if (!exists) await Voucher.create(voucher);
    console.log(`Voucher ${exists ? 'already exists' : 'added'}: ${voucher.code}`);
  }

  await mongoose.disconnect();
  console.log('Seeding finished!');
}

seed().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
