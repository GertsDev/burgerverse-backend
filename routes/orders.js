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
    toJSON: {
      transform: function (doc, ret) {
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
        return ret;
      },
    },
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
    default: 74235,
  },
});

const Counter = mongoose.model('Counter', counterSchema);

// Seed initial data
const seedInitialData = async () => {
  try {
    const count = await Order.countDocuments();
    if (count > 0) {
      console.log('Orders collection already has data, skipping seed');
      return;
    }

    const counterExists = await Counter.findOne({ name: 'orderNumber' });
    if (!counterExists) {
      await Counter.create({ name: 'orderNumber', count: 74235 });
    }

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
        name: 'Gerts space spicy люминесцентный бургер',
        createdAt: '2025-04-11T04:41:15.540Z',
        updatedAt: '2025-04-11T04:41:16.292Z',
        number: 74235,
      },
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
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    const total = await Order.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalToday = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    res.json({
      success: true,
      orders: orders.map((order) => ({
        ...order,
        createdAt: new Date(order.createdAt).toISOString(),
        updatedAt: new Date(order.updatedAt).toISOString(),
      })),
      total,
      totalToday,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
});

// POST new order
router.post('/', async (req, res) => {
  try {
    const { ingredients } = req.body;

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

    // Validate that all ingredients are strings
    if (!ingredients.every((id) => typeof id === 'string')) {
      return res.status(400).json({
        success: false,
        message: 'All ingredients must be string IDs',
      });
    }

    const counter = await Counter.findOneAndUpdate(
      { name: 'orderNumber' },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    const newOrder = new Order({
      _id: new mongoose.Types.ObjectId().toString(),
      ingredients,
      status: 'created',
      name: 'Custom Burger',
      number: counter.count,
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      name: newOrder.name,
      order: {
        ...newOrder.toJSON(),
        createdAt: newOrder.createdAt.toISOString(),
        updatedAt: newOrder.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
    });
  }
});

// GET order by number
router.get('/:number', async (req, res) => {
  try {
    const order = await Order.findOne({
      number: parseInt(req.params.number),
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      orders: [
        {
          ...order,
          createdAt: new Date(order.createdAt).toISOString(),
          updatedAt: new Date(order.updatedAt).toISOString(),
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
    });
  }
});

module.exports = router;
