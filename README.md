# Phraser - Mandarin Flashcards

A frontend-only flashcard app for learning Mandarin Chinese. TypeScript, Vite, React, TailwindCSS and React Router. Everything lives in your browser's local storage; there is no backend and no telemetry.

## Features

- **Add translations** one at a time, or import many at once from CSV
- **Automatic pinyin** with tone marks (ā, á, ǎ, à), generated via `pinyin-pro`
- **Flashcard practice** with weighted random selection, so cards you get wrong come up more often
- **Active input mode** - type your answer and have it checked, instead of self-grading
- **Reverse mode** - show the translation and expect the Mandarin, for character recall
- **Colour-coded cards** - green or red backing for a right or wrong answer in active input mode
- **Search** the saved list by Mandarin, English or pinyin
- **Export to CSV**, and reset everything, from Settings
- **Local storage persistence** - no account, no sync, no server

## Getting Started

### Prerequisites

Node 24 (see `.nvmrc`; `nvm use` picks it up). The `engines` field enforces it.

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Scripts

| Script                  | Does                                              |
| ----------------------- | ------------------------------------------------- |
| `npm run dev`           | Start the dev server                              |
| `npm run build`         | Type-check, then build for production             |
| `npm run preview`       | Serve the production build                        |
| `npm test`              | Run tests once                                    |
| `npm run test:watch`    | Run tests in watch mode                           |
| `npm run test:ui`       | Run tests with the Vitest UI                      |
| `npm run test:coverage` | Run tests with coverage, enforcing the thresholds |
| `npm run lint`          | ESLint, zero warnings tolerated                   |
| `npm run lint:fix`      | ESLint with `--fix`                               |
| `npm run type-check`    | Type-check the app and the config project         |
| `npm run format`        | Format with Prettier                              |
| `npm run format:check`  | Check formatting                                  |
| `npm run check`         | Everything CI runs, in the same order             |

## Keyboard

| Key                | Where                    | Does                                          |
| ------------------ | ------------------------ | --------------------------------------------- |
| `Space` or `Enter` | Flashcards               | Reveal the answer, then move to the next card |
| `Enter`            | Flashcards, answer field | Check the typed answer                        |
| `Space`            | Any text field           | Types a space - never triggers a shortcut     |
| `Enter`            | Edit form                | Save                                          |
| `Esc`              | Edit form, dialog, menu  | Cancel or close                               |
| `Tab`              | Dialog                   | Cycles within the dialog while it is open     |

Space and Enter behave identically everywhere except inside a text field, where Space has to type a space and `Enter` is the only reveal key. Shortcuts also stand down while an IME is composing, so a pinyin IME can use Space to commit a candidate.

## Usage

### Adding translations

Enter the Mandarin and its English translation on the Add Translation page. Pinyin is generated for you.

### Batch import

The Batch Import tab takes CSV, pasted or dropped as a file, in the form `mandarin,translation` - one entry per line. A first row that looks like a header is skipped. Fields containing commas should be quoted. Imported rows are shown for review, where you can edit or drop individual entries, before anything is saved.

### Practising

Reveal the answer, then move on. With **Active Input Mode** on, you type the answer first and it is checked: comparison ignores case, diacritics and punctuation, and an empty answer counts as wrong. Scores are recorded only in this mode.

### Managing

The All Translations page lists everything, one row per entry. Expand a row for pinyin, the translation and its score. Search matches Mandarin, English and pinyin, ignoring tone marks, so `ni hao` finds `nǐ hǎo`. The query lives in the URL as `?q=`.

## Accessibility

- Skip link, landmark regions, and `aria-current` on the active nav item
- Focus moves to the main region on navigation, and the route is announced politely
- Dialogs use `role="dialog"` with a focus trap and focus restored on close
- Every control is reachable and operable by keyboard, with a visible focus ring
- Animations are disabled under `prefers-reduced-motion`
- Checked by `eslint-plugin-jsx-a11y` at lint time and `axe-core` in the test suite

`axe` runs in jsdom, which has no layout or stylesheet. It checks semantics - roles, names, heading order, nested interactives - and cannot check colour contrast, hit-target size or focus order. Those still need a real browser.

## Data and privacy

Everything is stored under two local-storage keys, `phraser` and `phraser-settings`. Nothing leaves the browser. Clearing site data deletes your translations permanently, so export first if you care about them.

Note: reverse mode with active input previously scored every answer as correct, because Han characters were being stripped before comparison. Scores recorded that way are inflated and were left untouched rather than silently rewritten.

## Project structure

| Path                      | Holds                                                                      |
| ------------------------- | -------------------------------------------------------------------------- |
| `src/pages`               | One component per route, plus the 404                                      |
| `src/routes.tsx`          | The route table - path, label, element, layout mode                        |
| `src/components/layout`   | App shell, navigation, footer                                              |
| `src/components/features` | Flashcard, translation rows, editors, batch import                         |
| `src/components/ui`       | Button, Input, Card, Modal, Toast and friends                              |
| `src/hooks`               | `useHotkeys`, and the local-storage-backed store                           |
| `src/utils`               | Storage, translation service, probability, pinyin, CSV, search, comparison |
| `src/test`                | Test setup, the axe helper, shared helpers                                 |

## Testing

Vitest and React Testing Library, with coverage gated at 80% of lines, functions, branches and statements.

```bash
npm test
npm run test:coverage
```

## Deployment

`vercel.json` rewrites everything to `index.html` for client-side routing. Connect the repository to Vercel and deploy; make sure the project's Node version matches `.nvmrc`.

CI runs on pull requests and on pushes to `master`: formatting, lint, type-check, tests with coverage, and a production build, plus a separate `npm audit` job and a weekly scheduled audit.

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

**Special case**: an item with no attempts has no meaningful success rate, so `calculateSuccessRate` returns **0.5**. That value is only used for display reasoning -- `calculateWeight` short-circuits for zero-attempt items and never consults it. See the weight formula below.

#### Weight Calculation

```
if (total_attempts === 0):
  weight = 10.0  // Maximum weight for new items
else:
  weight = 1 / (success_rate + 0.1)
```

New items take the short-circuit branch, so they get the maximum weight directly rather than the 1.67 that a 0.5 success rate would otherwise produce.

The constant **0.1** in the formula prevents division by zero and ensures even perfect items still have a chance to appear.

#### Weight Examples

| Success Rate     | Correct | Incorrect | Weight | Relative Frequency |
| ---------------- | ------- | --------- | ------ | ------------------ |
| New (0 attempts) | 0       | 0         | 10.0   | Maximum (highest)  |
| 0.0 (0%)         | 0       | 10        | 10.0   | Highest            |
| 0.2 (20%)        | 2       | 8         | 3.33   | High               |
| 0.5 (50%)        | 5       | 5         | 1.67   | Medium             |
| 0.8 (80%)        | 8       | 2         | 1.11   | Low                |
| 1.0 (100%)       | 10      | 0         | 0.91   | Lowest             |

#### Selection Algorithm

1. Calculate weight for each translation using the formula above
2. Sum all weights to get `totalWeight`
3. Generate a random number between 0 and `totalWeight`
4. Iterate through translations, subtracting each weight from the random number
5. Select the translation where the cumulative weight exceeds the random number

This ensures that:

- Items with 0% success rate appear **~11x more often** than items with 100% success rate
- New items (no attempts) get **maximum weight** and appear most frequently, ensuring all new entries are practiced
- The system automatically adapts as you improve

### Example Scenario

If you have 4 translations:

- **Item A (New)**: 0 correct, 0 incorrect → weight = 10.0 (maximum)
- **Item B**: 0 correct, 5 incorrect → success_rate = 0.0 → weight = 10.0
- **Item C**: 5 correct, 5 incorrect → success_rate = 0.5 → weight = 1.67
- **Item D**: 10 correct, 0 incorrect → success_rate = 1.0 → weight = 0.91

Total weight = 22.58

Selection probabilities:

- **Item A (New)**: 10.0 / 22.58 = **44.3%** chance
- **Item B**: 10.0 / 22.58 = **44.3%** chance
- **Item C**: 1.67 / 22.58 = **7.4%** chance
- **Item D**: 0.91 / 22.58 = **4.0%** chance

New items and items with 0% success rate share the highest probability. As you practice and improve items, their weights decrease and they appear less frequently, naturally shifting focus to items that still need practice.

## Technologies

React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, React Router 7, Vitest 5, React Testing Library 16, ESLint 10, Prettier, axe-core, pinyin-pro, react-icons.

## License

MIT - see [LICENSE](LICENSE).
