import mongoose, { Document, Schema } from 'mongoose';
import { IUserDoc } from './User'; // Import User interface if needed for ref typing

export interface OrderType extends Document {
  _id: string;
  ingredients: string[];
  status: 'done' | 'pending' | 'created';
  name: string;
  createdAt: Date;
  updatedAt: Date;
  number: number;
  user: IUserDoc['_id']; // Use imported type
}

const orderSchema = new Schema<OrderType>(
  {
    _id: String,
    ingredients: [String],
    status: {
      type: String,
      enum: ['done', 'pending', 'created'],
      default: 'created',
      index: true, // Add index for status
    },
    name: String,
    createdAt: Date,
    updatedAt: Date,
    number: {
      type: Number,
      index: true, // Add index for number
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Add index for user
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

// Add compound index if needed, e.g., for user + status
// orderSchema.index({ user: 1, status: 1 });

export const Order = mongoose.model<OrderType>('Order', orderSchema);
