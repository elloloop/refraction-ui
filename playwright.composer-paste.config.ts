import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './packages/composer/browser_test', testMatch: ['composer-paste.spec.ts', 'composer-unicode.spec.ts'], outputDir: './e2e/results/composer-paste',
  workers: 1, reporter: 'list', use: { baseURL: 'http://localhost:7361' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium', permissions: ['clipboard-read', 'clipboard-write'] } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'ASTRO_DEV_BACKGROUND=1 pnpm exec astro dev --root e2e/fixtures/composer-paste --host 127.0.0.1 --port 7361',
    url: 'http://localhost:7361', reuseExistingServer: !process.env.CI,
  },
})
