import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules']),

  // Config files run in Node and have no type information available.
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: globals.node,
    },
  },

  // Application and tests.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      jsxA11y.flatConfigs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite(),
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: { allowDefaultProject: ['*.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Cherry-picked from strictTypeChecked: each one finds real defects here,
      // without the churn the full preset brings to idiomatic React.
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // The default depth of 2 does not reach label text nested inside a
      // wrapper span, which is how the toggle rows are laid out.
      'jsx-a11y/label-has-associated-control': ['error', { depth: 4 }],

      // TODO: re-enable once the derived-state-in-effect components are
      // reworked. These are React Compiler rules, new in react-hooks 7, and
      // each firing site needs a component refactor rather than a tweak:
      // Flashcard (x2), TranslationEditor, Flashcards, ListTranslations.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
    },
  },

  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },

  prettier,
]);
