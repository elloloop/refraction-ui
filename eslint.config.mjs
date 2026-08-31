import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Flat-config port of the former .eslintrc.cjs (ESLint 9).
//
// Deliberately NO type-aware linting here: the enabled presets
// (eslint:recommended + @typescript-eslint/recommended, non-type-checked)
// contain no rules that need type information, so we never set
// `parserOptions.project` / `projectService`. With the old project glob,
// every one of the ~260 per-package lint tasks constructed TypeScript
// programs spanning the whole monorepo (~390 tsconfigs) — O(packages²) work
// that dominated the CI react job.
//
// `files` is scoped to TS/TSX only: per-package lint scripts invoke
// `eslint <dir> --ext .ts,.tsx` from each package cwd (flat config is
// discovered by walking up to this file), and these globs keep the linted
// file set identical to the legacy `--ext` behavior — directory targets also
// match .js by default under flat config, and scoping keeps those out.
export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.node,
    },
    linterOptions: {
      // ESLint 9 defaults this to 'warn'; ESLint 8 defaulted to off. Keep the
      // old behavior so the migration introduces zero new warnings.
      reportUnusedDisableDirectives: 'off',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
);
