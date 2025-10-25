import { getAllColors, type Color } from '$lib';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const colors = getAllColors();

    return {
      colors: colors.map(color => ({
        id: color.id,
        ENG: color.ENG,
        SP: color.SP,
        created_at: color.created_at,
        updated_at: color.updated_at
      })),
      totalColors: colors.length,
      recentColors: colors.slice(-5).reverse()
    };
  } catch (error) {
    console.error('Error loading colors for home page:', error);
    return {
      colors: [],
      totalColors: 0,
      recentColors: []
    };
  }
};
