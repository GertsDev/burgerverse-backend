import { model, Schema } from "mongoose";
import { IInProgressOrder } from "./types/types";

const InProgressOrderSchema = new Schema<IInProgressOrder & Document>({
  name: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  number: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const InProgressOrder = model<IInProgressOrder & Document>(
  'InProgressOrder',
  InProgressOrderSchema
);
