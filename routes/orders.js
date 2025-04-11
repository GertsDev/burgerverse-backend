const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/burger-app'
    );
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Call the connect function
connectDB();

// Define Order Schema
const orderSchema = new mongoose.Schema(
  {
    _id: String,
    ingredients: [String],
    status: {
      type: String,
      enum: ['done', 'pending', 'created'],
      default: 'created',
    },
    name: String,
    createdAt: Date,
    updatedAt: Date,
    number: Number,
  },
  {
    timestamps: true,
    collection: 'orders',
  }
);

// Create Order model
const Order = mongoose.model('Order', orderSchema);

// Define counter schema for generating order numbers
const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 74235, // Starting from the latest order in your dataset
  },
});

const Counter = mongoose.model('Counter', counterSchema);

// Seed initial data (the 50 orders from your dataset)
const seedInitialData = async () => {
  try {
    // Check if data already exists
    const count = await Order.countDocuments();
    if (count > 0) {
      console.log('Orders collection already has data, skipping seed');
      return;
    }

    // Initialize counter
    const counterExists = await Counter.findOne({ name: 'orderNumber' });
    if (!counterExists) {
      await Counter.create({ name: 'orderNumber', count: 74235 });
    }

    // Your provided orders array (first few orders as example)
    const initialOrders = [
      {
        _id: '67f89d6be8e61d001cec1c9f',
        ingredients: [
          '643d69a5c3f7b9001cfa093c',
          '643d69a5c3f7b9001cfa093e',
          '643d69a5c3f7b9001cfa0943',
          '643d69a5c3f7b9001cfa0943',
          '643d69a5c3f7b9001cfa0942',
          '643d69a5c3f7b9001cfa093c',
        ],
        status: 'done',
        name: 'Краторный space spicy люминесцентный бургер',
        createdAt: '2025-04-11T04:41:15.540Z',
        updatedAt: '2025-04-11T04:41:16.292Z',
        number: 74235,
      },
      // Add more orders from your dataset here
    ];

    await Order.insertMany(initialOrders);
    console.log('Initial orders data seeded successfully');
  } catch (error) {
    console.error('Error seeding initial orders data:', error);
  }
};

// Call the seed function
seedInitialData();

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const total = await Order.countDocuments();

    // Calculate orders created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalToday = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    res.json({
      success: true,
      orders,
      total,
      totalToday,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
});

// PUT new order
router.put('/', async (req, res) => {
  try {
    const { name, ingredients } = req.body;

    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ingredients array',
      });
    }

    // Get next order number
    const counter = await Counter.findOneAndUpdate(
      { name: 'orderNumber' },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    const newOrder = new Order({
      _id: new mongoose.Types.ObjectId().toString(),
      ingredients,
      status: 'created',
      name: name || 'Custom Burger',
      number: counter.count,
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
    });
  }
});

// Route to add a specific order
router.post('/add-specific-order', async (req, res) => {
  try {
    // Create a new order with the specified data
    const newOrder = new Order({
      _id: new mongoose.Types.ObjectId().toString(),
      ingredients: [
        '9001cfa093c', // Example ingredients - you can adjust these
        '7b9001cfa0941',
        '643d69a5c3f7b9001cfa0942',
      ],
      status: 'created',
      name: 'Краторный spicy био-марсианский бургер',
      number: 7880,
    });

    // Save the order to the database
    await newOrder.save();

    // Also update the counter if needed to ensure future orders have higher numbers
    await Counter.findOneAndUpdate(
      { name: 'orderNumber' },
      {
        count: Math.max(
          7880,
          await Counter.findOne({ name: 'orderNumber' }).then((c) =>
            c ? c.count : 0
          )
        ),
      },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      name: 'Краторный spicy био-марсианский бургер',
      order: {
        number: 7880,
      },
    });
  } catch (error) {
    console.error('Error adding specific order:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding specific order',
    });
  }
});

// Endpoint to directly add the specific order object you provided
router.post('/feed', async (req, res) => {
  try {
    // Create the order from the provided data
    const newOrder = new Order({
      _id: new mongoose.Types.ObjectId().toString(),
      ingredients: req.body.ingredients || [
        '643d69a5c3f7b9001cfa093c', // Default ingredients if none provided
        '643d69a5c3f7b9001cfa0941',
        '643d69a5c3f7b9001cfa0942',
      ],
      status: 'created',
      name: 'Краторный spicy био-марсианский бургер',
      number: 7880,
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      name: 'Краторный spicy био-марсианский бургер',
      order: {
        number: 7880,
      },
    });
  } catch (error) {
    console.error('Error adding order to feed:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding order to feed',
    });
  }
});

module.exports = router;
