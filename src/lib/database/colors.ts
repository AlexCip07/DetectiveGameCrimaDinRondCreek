import { statements, db } from './database.js';
import { Color, ColorInsert, ColorUpdate } from './types.js';

/**
 * Insert a new color into the Colors table
 */
export function insertColor(color: ColorInsert): Color {
  const result = statements.insertColor.run(color.ENG, color.SP);

  return {
    id: result.lastInsertRowid as number,
    ENG: color.ENG,
    SP: color.SP,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Get all colors from the Colors table
 */
export function getAllColors(): Color[] {
  return statements.getAllColors.all() as Color[];
}

/**
 * Get a color by its ID
 */
export function getColorById(id: number): Color | undefined {
  return statements.getColorById.get(id) as Color | undefined;
}

/**
 * Get a color by its English name
 */
export function getColorByEng(eng: string): Color | undefined {
  return statements.getColorByEng.get(eng) as Color | undefined;
}

/**
 * Get a color by its Spanish name
 */
export function getColorBySp(sp: string): Color | undefined {
  return statements.getColorBySp.get(sp) as Color | undefined;
}

/**
 * Update an existing color
 */
export function updateColor(color: ColorUpdate): boolean {
  const result = statements.updateColor.run(color.ENG, color.SP, color.id);
  return result.changes > 0;
}

/**
 * Delete a color by its ID
 */
export function deleteColor(id: number): boolean {
  const result = statements.deleteColor.run(id);
  return result.changes > 0;
}

/**
 * Delete a color by its English name
 */
export function deleteColorByEng(eng: string): boolean {
  const result = statements.deleteColorByEng.run(eng);
  return result.changes > 0;
}

/**
 * Delete a color by its Spanish name
 */
export function deleteColorBySp(sp: string): boolean {
  const result = statements.deleteColorBySp.run(sp);
  return result.changes > 0;
}

/**
 * Insert multiple colors at once
 */
export function insertMultipleColors(colors: ColorInsert[]): Color[] {
  const insertedColors: Color[] = [];

  // Use the transaction from database.ts
  statements.insertMultipleColors(colors);

  // Get the inserted colors to return them with IDs
  for (const color of colors) {
    const inserted = getColorByEng(color.ENG);
    if (inserted) {
      insertedColors.push(inserted);
    }
  }

  return insertedColors;
}

/**
 * Search colors by English name (partial match)
 */
export function searchColorsByEng(searchTerm: string): Color[] {
  const db = statements.getAllColors;
  const allColors = db.all() as Color[];

  return allColors.filter(color =>
    color.ENG.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

/**
 * Search colors by Spanish name (partial match)
 */
export function searchColorsBySp(searchTerm: string): Color[] {
  const db = statements.getAllColors;
  const allColors = db.all() as Color[];

  return allColors.filter(color =>
    color.SP.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

/**
 * Get colors count
 */
export function getColorsCount(): number {
  const db = statements.getAllColors;
  const allColors = db.all() as Color[];
  return allColors.length;
}
