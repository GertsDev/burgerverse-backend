import mongoose, { Document, Schema } from 'mongoose';

export interface CounterType extends Document {
  name: string;
  count: number;
}

const counterSchema = new Schema<CounterType>({
  name: { type: String, required: true, unique: true },
  count: { type: Number, default: 74235 },
});

export const Counter = mongoose.model<CounterType>('Counter', counterSchema);
