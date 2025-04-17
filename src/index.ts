import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import authRouter from './routes/auth';
import ingredientsRouter from './routes/ingredients';
import ordersRouter from './routes/orders';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: Error) => console.error('MongoDB connection error:', err));

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
