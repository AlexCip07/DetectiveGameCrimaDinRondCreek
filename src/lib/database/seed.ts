import { insertMultipleColors } from './colors.js';

// Sample color data in English and Spanish
const sampleColors = [
  { ENG: 'Red', SP: 'Rojo' },
  { ENG: 'Blue', SP: 'Azul' },
  { ENG: 'Green', SP: 'Verde' },
  { ENG: 'Yellow', SP: 'Amarillo' },
  { ENG: 'Black', SP: 'Negro' },
  { ENG: 'White', SP: 'Blanco' },
  { ENG: 'Orange', SP: 'Naranja' },
  { ENG: 'Purple', SP: 'Púrpura' },
  { ENG: 'Pink', SP: 'Rosa' },
  { ENG: 'Brown', SP: 'Marrón' },
  { ENG: 'Gray', SP: 'Gris' },
  { ENG: 'Cyan', SP: 'Cian' },
  { ENG: 'Magenta', SP: 'Magenta' },
  { ENG: 'Lime', SP: 'Lima' },
  { ENG: 'Olive', SP: 'Oliva' },
  { ENG: 'Maroon', SP: 'Granate' },
  { ENG: 'Navy', SP: 'Azul Marino' },
  { ENG: 'Teal', SP: 'Verde Azulado' },
  { ENG: 'Silver', SP: 'Plateado' },
  { ENG: 'Gold', SP: 'Dorado' }
];

/**
 * Seed the Colors table with sample data
 */
export function seedColorsTable(): void {
  try {
    const insertedColors = insertMultipleColors(sampleColors);
    console.log(`Successfully inserted ${insertedColors.length} colors into the database`);
  } catch (error) {
    console.error('Error seeding colors table:', error);
  }
}

