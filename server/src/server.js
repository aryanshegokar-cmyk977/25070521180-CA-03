require('dotenv').config({ quiet: true });
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Did you create the server/.env file? (see README)');
  process.exit(1);
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`BookVerse server running at http://localhost:${PORT}`);
  });
});
