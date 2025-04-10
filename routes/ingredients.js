const express = require('express');
const router = express.Router();

// Define the type for a single ingredient (using JSDoc for type hints in JS)
/**
 * @typedef {object} TIngredient
 * @property {string} _id
 * @property {string} name
 * @property {string} type
 * @property {number} proteins
 * @property {number} fat
 * @property {number} carbohydrates
 * @property {number} calories
 * @property {number} price
 * @property {string} image
 * @property {string} image_large
 * @property {string} image_mobile
 */

// Store the ingredient data
/** @type {TIngredient[]} */
const ingredientsData = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'N-200i Crater Crunch Bun',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Martian Magnolia Bio-Patty',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://code.s3.yandex.net/react/code/meat-01.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa093e',
    name: 'Glow-in-the-Dark Tetra Fish Fillet',
    type: 'main',
    proteins: 44,
    fat: 26,
    carbohydrates: 85,
    calories: 643,
    price: 988,
    image: 'https://code.s3.yandex.net/react/code/meat-03.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-03-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-03-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0942',
    name: 'Spicy-X Blast Sauce',
    type: 'sauce',
    proteins: 30,
    fat: 20,
    carbohydrates: 40,
    calories: 30,
    price: 90,
    image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0943',
    name: 'Signature Space Glaze',
    type: 'sauce',
    proteins: 50,
    fat: 22,
    carbohydrates: 11,
    calories: 14,
    price: 80,
    image: 'https://code.s3.yandex.net/react/code/sauce-04.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-04-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-04-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa093f',
    name: 'Everlasting Protostomia Slug Steak',
    type: 'main',
    proteins: 433,
    fat: 244,
    carbohydrates: 33,
    calories: 420,
    price: 1337,
    image: 'https://code.s3.yandex.net/react/code/meat-02.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-02-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0940',
    name: 'Meteorite Beef Smash Patty',
    type: 'main',
    proteins: 800,
    fat: 800,
    carbohydrates: 300,
    calories: 2674,
    price: 3000,
    image: 'https://code.s3.yandex.net/react/code/meat-04.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-04-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-04-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa093d',
    name: 'R2-D3 Glow Bun',
    type: 'bun',
    proteins: 44,
    fat: 26,
    carbohydrates: 85,
    calories: 643,
    price: 988,
    image: 'https://code.s3.yandex.net/react/code/bun-01.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-01-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-01-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0944',
    name: 'Classic Galaxy Drizzle',
    type: 'sauce',
    proteins: 42,
    fat: 24,
    carbohydrates: 42,
    calories: 99,
    price: 15,
    image: 'https://code.s3.yandex.net/react/code/sauce-03.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-03-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-03-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0945',
    name: 'Antarian Flat-Walker Spike Sauce',
    type: 'sauce',
    proteins: 101,
    fat: 99,
    carbohydrates: 100,
    calories: 100,
    price: 88,
    image: 'https://code.s3.yandex.net/react/code/sauce-01.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-01-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-01-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0946',
    name: 'Cosmic Crunch Rings',
    type: 'main',
    proteins: 808,
    fat: 689,
    carbohydrates: 609,
    calories: 986,
    price: 300,
    image: 'https://code.s3.yandex.net/react/code/mineral_rings.png',
    image_mobile:
      'https://code.s3.yandex.net/react/code/mineral_rings-mobile.png',
    image_large:
      'https://code.s3.yandex.net/react/code/mineral_rings-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0947',
    name: 'Phallenian Star Pods',
    type: 'main',
    proteins: 20,
    fat: 5,
    carbohydrates: 55,
    calories: 77,
    price: 874,
    image: 'https://code.s3.yandex.net/react/code/sp_1.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sp_1-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/sp_1-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0948',
    name: 'Martian Alpha-Sugar Crystals',
    type: 'main',
    proteins: 234,
    fat: 432,
    carbohydrates: 111,
    calories: 189,
    price: 762,
    image: 'https://code.s3.yandex.net/react/code/core.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/core-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/core-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0949',
    name: 'Exo-Plantago Micro Greens',
    type: 'main',
    proteins: 1,
    fat: 2,
    carbohydrates: 3,
    calories: 6,
    price: 4400,
    image: 'https://code.s3.yandex.net/react/code/salad.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/salad-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/salad-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa094a',
    name: 'Asteroid Blue Cheese',
    type: 'main',
    proteins: 84,
    fat: 48,
    carbohydrates: 420,
    calories: 3377,
    price: 4142,
    image: 'https://code.s3.yandex.net/react/code/cheese.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/cheese-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/cheese-large.png',
  },
];

// Define the GET route handler for /api/ingredients
router.get('/', (req, res) => {
  try {
    // In a real app, you might fetch from a database here
    // For now, return the static data

    // Simulate potential errors (optional)
    // if (Math.random() > 0.8) {
    //   throw new Error('Failed to fetch ingredients');
    // }

    res.json({
      success: true,
      data: ingredientsData,
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: [], // Return empty array on error
    });
  }
});

module.exports = router;
