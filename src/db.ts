// src/db.ts
import mongoose from 'mongoose';

const isProd = process.env.NODE_ENV === 'production';

// Pick the right URI:
const LOCAL_URI = 'mongodb://localhost:27017/burgerverse';
const RAILWAY_URI =
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  process.env.MONGO_PUBLIC_URL ||
  '';
const MONGO_URI = isProd ? RAILWAY_URI : LOCAL_URI;

if (!MONGO_URI) {
  console.error('✖️  No Mongo URI—check your env!');
  process.exit(1);
}

// Only connect once:
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected:', MONGO_URI))
    .catch((err) => {
      console.error('✖️ MongoDB connection error:', err);
      process.exit(1);
    });
}

export default mongoose;
