import { Counter } from '../models/Counter';
import { Order } from '../models/Order';

export const seedInitialData = async () => {
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
        createdAt: new Date('2025-04-11T04:41:15.540Z'),
        updatedAt: new Date('2025-04-11T04:41:16.292Z'),
        number: 74235,
      },
    ];
    await Order.insertMany(initialOrders);
    console.log('Initial orders data seeded successfully');
  } catch (error) {
    console.error('Error seeding initial orders data:', error);
  }
};
