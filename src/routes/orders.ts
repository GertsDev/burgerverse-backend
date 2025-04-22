import express from 'express';
import type { AuthRequest } from '../middleware/authMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { Counter } from '../models/Counter';
import { InProgressOrder } from '../models/InProgressOrders';
import { Order } from '../models/Order';
import { ReadyOrder } from '../models/ReadyOrders';

const router = express.Router();

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

// GET orders for the authenticated user
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userId = (req as AuthRequest).userId;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({
      success: true,
      orders: orders.map((order) => ({
        ...order,
        createdAt: new Date(order.createdAt).toISOString(),
        updatedAt: new Date(order.updatedAt).toISOString(),
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error fetching user orders' });
  }
});

// POST new order
router.post('/', authMiddleware, async (req, res) => {
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
      _id: new (require('mongoose').Types.ObjectId)().toString(),
      ingredients,
      status: 'created',
      name: 'Custom Burger',
      number: counter.count,
      user: (req as AuthRequest).userId,
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
      number: parseInt(req.params.number, 10),
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

// POST in progress orders
router.post('/in-progress', async (req, res) => {
  try {
    const { orderData } = req.body;
    if (!orderData) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing order data' });
    }
    const newOrder = new InProgressOrder(orderData);
    await newOrder.save();
    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error creating in-progress order' });
  }
});

// GET in progress orders
router.get('/in-progress', async (req, res) => {
  const orders = await InProgressOrder.find().sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// GET ready orders
router.get('/ready', async (req, res) => {
  const orders = await ReadyOrder.find().sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

export default router;
