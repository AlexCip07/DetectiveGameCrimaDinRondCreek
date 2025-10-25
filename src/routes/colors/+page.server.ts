import { getAllColors, insertColor, updateColor, deleteColorByEng, type Color } from '$lib';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  // This will trigger database initialization
  const colors = getAllColors();

  return {
    colors: colors.map(color => ({
      id: color.id,
      ENG: color.ENG,
      SP: color.SP,
      created_at: color.created_at,
      updated_at: color.updated_at
    }))
  };
};

export const actions: Actions = {
  add: async ({ request }) => {
    const data = await request.formData();
    const ENG = data.get('ENG') as string;
    const SP = data.get('SP') as string;

    if (!ENG?.trim() || !SP?.trim()) {
      return { success: false, error: 'Both English and Spanish names are required', action: 'add' };
    }

    try {
      insertColor({ ENG: ENG.trim(), SP: SP.trim() });
      return { success: true, action: 'add' };
    } catch (error) {
      return { success: false, error: 'Failed to add color', action: 'add' };
    }
  },

  update: async ({ request }) => {
    const data = await request.formData();
    const id = parseInt(data.get('id') as string);
    const ENG = data.get('ENG') as string;
    const SP = data.get('SP') as string;

    if (!id || !ENG?.trim() || !SP?.trim()) {
      return { success: false, error: 'All fields are required for update', action: 'update' };
    }

    try {
      const success = updateColor({ id, ENG: ENG.trim(), SP: SP.trim() });
      return { success, action: 'update' };
    } catch (error) {
      return { success: false, error: 'Failed to update color', action: 'update' };
    }
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const ENG = data.get('ENG') as string;

    if (!ENG?.trim()) {
      return { success: false, error: 'Color name is required for deletion', action: 'delete' };
    }

    try {
      const success = deleteColorByEng(ENG.trim());
      return { success, action: 'delete' };
    } catch (error) {
      return { success: false, error: 'Failed to delete color', action: 'delete' };
    }
  }
};
