module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./packages/cli/tsconfig.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['dist', 'node_modules'],
  overrides: [
    {
      files: ['packages/cli/vitest.config.ts'],
      parserOptions: {
        project: null,
      },
    },
  ],
  rules: {},
};
