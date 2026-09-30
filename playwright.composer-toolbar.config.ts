import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './packages/astro-composer/browser_test',
  outputDir: './e2e/results/composer-toolbar',
  use: { baseURL: 'http://127.0.0.1:4396' },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }, { name: 'webkit', use: { ...devices['Desktop Safari'] } }],
  webServer: { command: 'ASTRO_DEV_BACKGROUND=1 pnpm exec astro dev --root e2e/fixtures/composer-toolbar --host 127.0.0.1 --port 4396', url: 'http://127.0.0.1:4396', reuseExistingServer: !process.env.CI },
})
