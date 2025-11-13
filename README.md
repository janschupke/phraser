# Phraser - Mandarin Flashcards

A modern, frontend-only flashcard application for learning Mandarin Chinese. Built with TypeScript, Vite, React, TailwindCSS, and React Router. All data persists in browser local storage.

## Features

### Core Functionality

- **Add Translations**: Input Mandarin words/phrases/sentences with their English translations
- **Automatic Pinyin Generation**: Pinyin with tone marks (ā, á, ǎ, à) is automatically generated using the `pinyin-pro` library
- **Flashcard Practice**: Endless flashcard sequence with random entry selection
- **Manage Translations**: View, edit, and delete all saved translations with an intuitive interface
- **Local Storage Persistence**: All data persists in browser local storage (no backend required)

### User Experience

- **Keyboard Shortcuts**:
  - `Enter` - Reveal answer / Show next card (flashcards)
  - `Esc` - Cancel editing / Clear input focus
  - `←` / `→` - Navigate between pages (when not typing)
- **Toast Notifications**: Success and error notifications appear in the top-right corner
- **Custom Confirm Modal**: Styled confirmation dialogs for destructive actions
- **Smooth Animations**: Page transitions, modal animations, and flashcard flip effects
- **Responsive Design**: Optimized for mobile, tablet, and desktop screens
- **Auto-focus**: Input fields automatically focus when entering edit mode or adding translations

### Technical Features

- **Type Safety**: Full TypeScript coverage
- **Component Architecture**: Separated into UI components, layout components, and feature components
- **Testing**: Comprehensive unit tests with Vitest and React Testing Library
- **Code Quality**: ESLint, Prettier, and TypeScript type checking
- **CI/CD**: GitHub Actions workflow for automated testing and validation

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run check` - Run all checks (lint, format, type-check, test, build)

## Project Structure

```
src/
├── components/
│   ├── features/          # Feature-specific components
│   │   ├── Flashcard.tsx           # Flashcard display component
│   │   ├── TranslationCard.tsx     # Translation card in list view
│   │   ├── TranslationEditor.tsx   # Inline translation editor
│   │   └── TranslationForm.tsx    # Form for adding/editing translations
│   ├── layout/            # Layout components
│   │   ├── Navigation.tsx         # Top navigation with keyboard shortcuts
│   │   └── Footer.tsx             # Footer with GitHub link
│   └── ui/                # Reusable UI components
│       ├── Alert.tsx              # Alert message component
│       ├── Button.tsx             # Button component with variants
│       ├── Card.tsx               # Card container component
│       ├── ConfirmModal.tsx       # Confirmation dialog modal
│       ├── Input.tsx              # Input field component
│       ├── PageTitle.tsx          # Page title component
│       └── Toast.tsx              # Toast notification component
├── contexts/
│   └── ToastContext.tsx   # Toast notification context provider
├── pages/
│   ├── AddTranslation.tsx    # Add translation page
│   ├── Flashcards.tsx         # Flashcard practice page
│   └── ListTranslations.tsx   # List all translations page
├── utils/
│   └── storage.ts          # Local storage utilities with pinyin generation
├── test/
│   └── setup.ts            # Test setup configuration
├── types.ts                # TypeScript type definitions
├── App.tsx                 # Main app component with routing
├── main.tsx                # Entry point
└── index.css               # TailwindCSS imports and animations
```

## Usage

### Adding Translations

1. Navigate to the "Add Translation" page (default home page)
2. Enter Mandarin text in the first field
3. Enter English translation in the second field
4. Click "Add Translation" or press `Enter`
5. Pinyin with tone marks is automatically generated

### Practicing with Flashcards

1. Go to the "Flashcards" page
2. View the Mandarin text
3. Press `Enter` or click "Click to reveal answer" to see the translation and pinyin
4. Press `Enter` again or click "Next Card" to move to the next random card

### Active Input Mode

Enable "Active Input Mode" in Settings to practice by typing translations:

1. Go to Settings and enable "Active Input Mode"
2. Return to Flashcards page
3. Type your translation answer in the input field
4. Press `Enter` or click "Check Answer" to see if you're correct
5. Answers are validated case-insensitively, ignoring accents/diacritics and punctuation
6. Your score is automatically tracked (correct/incorrect counts)
7. Items you struggle with appear more frequently (see Probability System below)

### Managing Translations

1. Visit "All Translations" to see all saved entries
2. Click the pencil icon to edit a translation
3. Click the trash icon to delete a translation
4. Use `Enter` to save edits, `Esc` to cancel

### Keyboard Navigation

- Use `←` and `→` arrow keys to navigate between pages (when not typing in inputs)
- Arrow keys work intelligently: they navigate when cursor is at the start/end of input fields

## Testing

The project includes comprehensive unit tests for:

- Storage utilities (localStorage operations, pinyin generation)
- UI components (Button, Input, Card, Alert, etc.)
- Feature components (Flashcard, TranslationForm, TranslationEditor, etc.)
- Page components (AddTranslation, ListTranslations)

Run tests with:

```bash
npm run test
```

## Deployment

### Vercel

The project includes a `vercel.json` configuration file for easy deployment to Vercel. Simply connect your repository to Vercel and deploy.

### GitHub Actions

The project includes a CI workflow (`.github/workflows/ci.yml`) that runs on pull requests:

- Tests
- Type checking
- Linting
- Format checking

## Scoring & Probability System

Phraser includes an intelligent probability-based selection system that helps you focus on items you struggle with. This system only activates when **Active Input Mode** is enabled.

### How Scoring Works

- Each translation tracks two counters: `correctCount` and `incorrectCount`
- Scores are only recorded when Active Input Mode is enabled and you check your answer
- Empty answers are considered incorrect
- Scores persist across sessions in local storage

### Probability Formula

The system uses a weighted random selection algorithm where items with lower success rates appear more frequently.

#### Success Rate Calculation

```
success_rate = correctCount / (correctCount + incorrectCount)
```

**Special case**: Items with no attempts (both counts = 0) get a default success rate of **0.5 (50%)**.

#### Weight Calculation

```
weight = 1 / (success_rate + 0.1)
```

The constant **0.1** prevents division by zero and ensures even perfect items still have a chance to appear.

#### Weight Examples

| Success Rate  | Correct | Incorrect | Weight | Relative Frequency |
| ------------- | ------- | --------- | ------ | ------------------ |
| 0.0 (0%)      | 0       | 10        | 10.0   | Highest            |
| 0.2 (20%)     | 2       | 8         | 3.33   | High               |
| 0.5 (50%)     | 5       | 5         | 1.67   | Medium             |
| 0.8 (80%)     | 8       | 2         | 1.11   | Low                |
| 1.0 (100%)    | 10      | 0         | 0.91   | Lowest             |
| 0.5 (default) | 0       | 0         | 1.67   | Medium (new items) |

#### Selection Algorithm

1. Calculate weight for each translation using the formula above
2. Sum all weights to get `totalWeight`
3. Generate a random number between 0 and `totalWeight`
4. Iterate through translations, subtracting each weight from the random number
5. Select the translation where the cumulative weight exceeds the random number

This ensures that:

- Items with 0% success rate appear **~11x more often** than items with 100% success rate
- New items (no attempts) appear at medium frequency
- The system automatically adapts as you improve

### Example Scenario

If you have 3 translations:

- **Item A**: 0 correct, 5 incorrect → success_rate = 0.0 → weight = 10.0
- **Item B**: 5 correct, 5 incorrect → success_rate = 0.5 → weight = 1.67
- **Item C**: 10 correct, 0 incorrect → success_rate = 1.0 → weight = 0.91

Total weight = 12.58

Selection probabilities:

- **Item A**: 10.0 / 12.58 = **79.5%** chance
- **Item B**: 1.67 / 12.58 = **13.3%** chance
- **Item C**: 0.91 / 12.58 = **7.2%** chance

As you improve Item A, its weight decreases and it appears less frequently, naturally shifting focus to items that still need practice.

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **pinyin-pro** - Pinyin generation with tone marks
- **Vitest** - Test runner
- **React Testing Library** - Component testing utilities
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **react-icons** - Icon library (Heroicons)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
