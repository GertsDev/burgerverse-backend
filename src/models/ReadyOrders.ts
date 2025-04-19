import { model, Schema } from "mongoose";
import { IReadyOrder } from "./types/types";

const ReadyOrderSchema = new Schema<IReadyOrder & Document>({
  name: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  number: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ReadyOrder = model<IReadyOrder & Document>(
  'ReadyOrder',
  ReadyOrderSchema
);
