const express = require('express');
const cors = require('cors');
const ingredientsRouter = require('./routes/ingredients'); // Adjust path if needed

const app = express();
const PORT = process.env.PORT || 3001; // Use environment variable or default

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust in production)
app.use(express.json()); // Middleware to parse JSON bodies

// Mount the ingredients router
// Requests to /api/ingredients will be handled by ingredientsRouter
app.use('/api/ingredients', ingredientsRouter);

// Basic route for testing the server root
app.get('/', (req, res) => {
  res.json({ message: 'Express server is running!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
});
