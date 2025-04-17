import express, { Request, Response } from 'express';
import { Ingredient } from '../models/Ingredient';

const router = express.Router();

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
