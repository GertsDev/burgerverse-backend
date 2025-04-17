import mongoose, { Document, Schema } from 'mongoose';

export interface IngredientType extends Document {
  _id: string;
  name: string;
  type: string;
  proteins: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  price: number;
  image: string;
  image_large: string;
  image_mobile: string;
}

const ingredientSchema = new Schema<IngredientType>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  proteins: { type: Number, required: true },
  fat: { type: Number, required: true },
  carbohydrates: { type: Number, required: true },
  calories: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  image_large: { type: String, required: true },
  image_mobile: { type: String, required: true },
});

export const Ingredient = mongoose.model<IngredientType>(
  'Ingredient',
  ingredientSchema
);
