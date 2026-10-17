import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './packages/astro-date-picker/browser_test',
  outputDir: './e2e/results/astro-date-picker',
  use: { baseURL: 'http://127.0.0.1:4411' },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }, { name: 'webkit', use: { ...devices['Desktop Safari'] } }],
  webServer: { command: 'ASTRO_DEV_BACKGROUND=1 pnpm exec astro dev --root e2e/fixtures/astro-date-picker --host 127.0.0.1 --port 4411', url: 'http://127.0.0.1:4411', reuseExistingServer: !process.env.CI },
})
