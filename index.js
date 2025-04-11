require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const ingredientsRouter = require('./routes/ingredients'); // Adjust path if needed
const ordersRouter = require('./routes/orders'); // Add this line

const app = express();
const PORT = process.env.PORT || 3001; // Use environment variable or default

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust in production)
app.use(express.json()); // Middleware to parse JSON bodies

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Mount routes WITH /api prefix to match frontend configuration
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/orders', ordersRouter);

// Basic route for testing the server root
app.get('/', (req, res) => {
  res.json({ message: 'Express server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
});
