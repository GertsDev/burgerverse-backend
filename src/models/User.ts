// src/models/User.ts
import { Document, model, Model, Schema, Types } from 'mongoose';

// 1) payload interface (no _id here)
export interface IUser {
  email: string;
  name: string;
  password: string;
}

// 2) document interface extends mongoose.Document
export interface IUserDoc extends IUser, Document {
  _id: Types.ObjectId;
}

// 3) create schema over IUserDoc
const userSchema = new Schema<IUserDoc>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// 4) model<IUserDoc> so TS knows `_id` is ObjectId
const User: Model<IUserDoc> = model<IUserDoc>('User', userSchema);
export default User;
