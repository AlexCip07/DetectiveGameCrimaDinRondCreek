# Colors Database

This directory contains the SQLite database setup for storing color names in English and Spanish.

## Database Structure

The database uses SQLite with the following table:

### Colors Table
```sql
CREATE TABLE Colors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ENG TEXT NOT NULL UNIQUE,
  SP TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Files

- `database.ts` - Main database initialization and connection
- `types.ts` - TypeScript interfaces for database entities
- `colors.ts` - Utility functions for Colors table operations
- `seed.ts` - Sample data seeding functions
- `test.ts` - Database testing functions
- `README.md` - This documentation

## Usage

### Import Database Functions

```typescript
import {
  getAllColors,
  insertColor,
  getColorById,
  getColorByEng,
  updateColor,
  deleteColorByEng,
  type Color
} from '$lib';
```

### Basic Operations

```typescript
// Get all colors
const colors = getAllColors();

// Add a new color
const newColor = insertColor({ ENG: 'Red', SP: 'Rojo' });

// Get color by English name
const color = getColorByEng('Red');

// Update a color
updateColor({ id: 1, ENG: 'Crimson', SP: 'Carmín' });

// Delete a color
deleteColorByEng('Red');
```

## Database File Location

The SQLite database file is created at: `database.sqlite` (in the project root)

## Auto-Seeding

The database automatically seeds itself with 20 sample colors on first initialization:
- Red/Rojo, Blue/Azul, Green/Verde, etc.

## Demo Page

Visit `/colors` in your application to see a working demo with a full CRUD interface.

## API Reference

### Color Interface
```typescript
interface Color {
  id?: number;
  ENG: string;
  SP: string;
  created_at?: string;
  updated_at?: string;
}
```

### Available Functions

- `getAllColors(): Color[]` - Get all colors
- `insertColor(color: ColorInsert): Color` - Add new color
- `getColorById(id: number): Color | undefined` - Get by ID
- `getColorByEng(eng: string): Color | undefined` - Get by English name
- `getColorBySp(sp: string): Color | undefined` - Get by Spanish name
- `updateColor(color: ColorUpdate): boolean` - Update existing color
- `deleteColor(id: number): boolean` - Delete by ID
- `deleteColorByEng(eng: string): boolean` - Delete by English name
- `deleteColorBySp(sp: string): boolean` - Delete by Spanish name
- `insertMultipleColors(colors: ColorInsert[]): Color[]` - Bulk insert
- `searchColorsByEng(term: string): Color[]` - Search by English (partial)
- `searchColorsBySp(term: string): Color[]` - Search by Spanish (partial)
- `getColorsCount(): number` - Get total count

