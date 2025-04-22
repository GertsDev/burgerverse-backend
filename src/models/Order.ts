import mongoose, { Document, Schema } from 'mongoose';

export interface OrderType extends Document {
  _id: string;
  ingredients: string[];
  status: 'done' | 'pending' | 'created';
  name: string;
  createdAt: Date;
  updatedAt: Date;
  number: number;
  user: mongoose.Types.ObjectId;
}

const orderSchema = new Schema<OrderType>(
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'orders',
    toJSON: {
      transform: (doc, ret) => {
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
        return ret;
      },
    },
  }
);

export const Order = mongoose.model<OrderType>('Order', orderSchema);
