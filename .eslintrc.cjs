module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // Deliberately NO `project` here: the enabled rules (eslint:recommended +
    // @typescript-eslint/recommended) contain no type-aware rules, so building
    // a TypeScript program per lint task was pure cost. With the old
    // `project: ['./packages/*/tsconfig.json']` glob, every one of the ~260
    // per-package lint tasks constructed programs spanning the whole monorepo
    // (~390 tsconfigs) — O(packages²) work that dominated the CI react job
    // (≈37 CPU-min of ≈84 total, ~14s median per tiny package).
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-object-type': 'off',
  },
};
