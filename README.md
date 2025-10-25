# 🌈 Colors Database

A modern web application for managing English-Spanish color translations using SQLite database.

## Features

- 🎨 **Color Management**: Add, edit, and delete color translations
- 🔄 **Real-time Updates**: Live database synchronization
- 🛡️ **Form Validation**: Server-side validation and error handling
- 📱 **Responsive Design**: Works on all device sizes
- 🗄️ **SQLite Database**: Lightweight and reliable data storage
- ✅ **Auto-seeding**: Pre-loaded with 20 sample colors

## Tech Stack

- **Frontend**: SvelteKit + TypeScript
- **Database**: SQLite with better-sqlite3
- **Styling**: Modern CSS with responsive design
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. Clone the repository:
```sh
git clone <your-repo-url>
cd colors-database
```

2. Install dependencies:
```sh
bun install
# or
npm install
```

3. Start the development server:
```sh
bun run dev
# or
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## Usage

### Main Page
- View database statistics and recent colors
- Navigate to the color management interface
- See feature overview

### Colors Management (`/colors`)
- **Add Colors**: Use the form to add new English-Spanish color pairs
- **Edit Colors**: Click "Edit" on any color to modify translations
- **Delete Colors**: Click "Delete" to remove colors from the database
- **View Data**: See all colors in a sortable table with timestamps

### Database Structure

The application uses a SQLite database with the following table:

```sql
CREATE TABLE Colors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ENG TEXT NOT NULL UNIQUE,
  SP TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API

### Database Functions

```typescript
import { getAllColors, insertColor, updateColor, deleteColorByEng } from '$lib';

// Get all colors
const colors = getAllColors();

// Add a new color
const newColor = insertColor({ ENG: 'Purple', SP: 'Púrpura' });

// Update a color
updateColor({ id: 1, ENG: 'Crimson', SP: 'Carmín' });

// Delete a color
deleteColorByEng('Purple');
```

## Building for Production

```sh
bun run build
# or
npm run build
```

## License

MIT
