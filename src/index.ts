import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import './db';
import authRouter from './routes/auth';
import ingredientsRouter from './routes/ingredients';
import ordersRouter from './routes/orders';

dotenv.config();
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}



const app = express();
const PORT = process.env.PORT || 3001;
app.use(cookieParser());
   app.use(express.json());
// Middleware
app.use(
  cors({
    origin: 'http://localhost:4000',
    credentials: true,
  })
);
app.use(express.json());

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  process.env.MONGO_PUBLIC_URL ||
  '';

if (!MONGO_URI) {
  console.error('✖️  No Mongo connection string found in env');
  process.exit(1);
}

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch((err) => {
    console.error('✖️  MongoDB connection error:', err);
    process.exit(1);
  });

// API routes
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Express server is running!' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
});


