import express, { Request, Response } from 'express';
import mongoose, { Document, Schema } from 'mongoose';
import { initialIngredients } from '../initialData/ingredientsData';

const router = express.Router();

// Ingredient Type
interface IngredientType extends Document {
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

// Define Ingredient Schema
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

// Create Ingredient model
const Ingredient = mongoose.model<IngredientType>(
  'Ingredient',
  ingredientSchema
);

// Seed initial data
const seedInitialData = async () => {
  try {
    const count = await Ingredient.countDocuments();
    if (count > 0) {
      console.log('Ingredients collection already has data, skipping seed');
      return;
    }

    await Ingredient.insertMany(initialIngredients);
    console.log('Initial ingredients data seeded successfully');
  } catch (error) {
    console.error('Error seeding initial ingredients data:', error);
  }
};

// Call the seed function
seedInitialData();

// GET all ingredients
router.get('/', async (req: Request, res: Response) => {
  try {
    const ingredients = await Ingredient.find().lean();
    res.json({
      success: true,
      data: ingredients,
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});

export default router;
