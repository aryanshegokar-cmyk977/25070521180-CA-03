const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/error');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const voucherRoutes = require('./routes/vouchers');
const libraryRoutes = require('./routes/library');
const reviewRoutes = require('./routes/reviews');

const app = express();

app.use(cors()); // lets the React app (on another port) talk to this server
app.use(express.json({ limit: '5mb' })); // reads JSON sent by the client (books can be large)

// Quick check that the server is alive: open http://localhost:5000/api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'BookVerse' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
