import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { insertMultipleColors } from './colors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '../../../database.sqlite');

// Create database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

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

// Prepare all database statements
function prepareStatements() {
  statements.insertColor = db.prepare(`
    INSERT OR REPLACE INTO Colors (ENG, SP, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `);

  statements.getAllColors = db.prepare('SELECT * FROM Colors ORDER BY ENG');

  statements.getColorById = db.prepare('SELECT * FROM Colors WHERE id = ?');

  statements.getColorByEng = db.prepare('SELECT * FROM Colors WHERE ENG = ?');

  statements.getColorBySp = db.prepare('SELECT * FROM Colors WHERE SP = ?');

  statements.updateColor = db.prepare(`
    UPDATE Colors
    SET ENG = ?, SP = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  statements.deleteColor = db.prepare('DELETE FROM Colors WHERE id = ?');

  statements.deleteColorByEng = db.prepare('DELETE FROM Colors WHERE ENG = ?');

  statements.deleteColorBySp = db.prepare('DELETE FROM Colors WHERE SP = ?');

  // Insert multiple colors at once
  statements.insertMultipleColors = db.transaction((colors: Array<{ENG: string, SP: string}>) => {
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO Colors (ENG, SP, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    for (const color of colors) {
      insertStmt.run(color.ENG, color.SP);
    }
  });
}

// Initialize database tables
export function initializeDatabase() {
  try {
    // Create Colors table
    db.exec(`
      CREATE TABLE IF NOT EXISTS Colors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ENG TEXT NOT NULL UNIQUE,
        SP TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Prepare statements now that table exists
    prepareStatements();

    // Check if table has data (safer approach with try-catch)
    let needsSeeding = true;
    try {
      const countResult = statements.getAllColors.all();
      needsSeeding = countResult.length === 0;
    } catch (error) {
      // If we can't query the table, assume it needs seeding
      console.log('Table might be new, proceeding with seeding...');
      needsSeeding = true;
    }

    // Seed with sample data if needed
    if (needsSeeding) {
      try {
        statements.insertMultipleColors(sampleColors);
        console.log(`Database initialized successfully with ${sampleColors.length} sample colors`);
      } catch (error) {
        console.error('Error seeding database:', error);
      }
    } else {
      console.log('Database already has data, skipping seeding');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Prepare statements for better performance - will be initialized after table creation
export const statements: any = {};

// Export database instance for advanced operations
export { db };

// Initialize database on module load
initializeDatabase();
