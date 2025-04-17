import { Ingredient } from '../models/Ingredient';
import { initialIngredients } from './ingredientsData';

export const seedIngredients = async () => {
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
