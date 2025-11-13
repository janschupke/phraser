# Phraser - Mandarin Flashcards

A frontend-only flashcard application for learning Mandarin Chinese, built with TypeScript, Vite, React, TailwindCSS, and React Router.

## Features

- **Add Translations**: Input Mandarin words/phrases/sentences with their English translations
- **Flashcard Practice**: Endless flashcard sequence with random entry selection
- **Manage Translations**: View, edit, and delete all saved translations
- **Local Storage**: All data persists in browser local storage

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment to Vercel

The project includes a `vercel.json` configuration file for easy deployment to Vercel. Simply connect your repository to Vercel and deploy.

## Project Structure

```
src/
  ├── pages/
  │   ├── AddTranslation.tsx    # Form to add new translations
  │   ├── Flashcards.tsx         # Flashcard practice view
  │   └── ListTranslations.tsx   # List all translations with edit/delete
  ├── utils/
  │   └── storage.ts             # Local storage utilities
  ├── types.ts                   # TypeScript type definitions
  ├── App.tsx                    # Main app component with routing
  ├── main.tsx                   # Entry point
  └── index.css                  # TailwindCSS imports
```

## Usage

1. **Add Translations**: Navigate to the "Add Translation" page and enter Mandarin text with its English translation
2. **Practice**: Go to "Flashcards" to practice with randomly selected cards
3. **Manage**: Visit "All Translations" to view, edit, or delete your saved translations
