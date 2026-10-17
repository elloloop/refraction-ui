import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './packages/astro-toast/browser_test',
  outputDir: './e2e/results/astro-toaster',
  use: { baseURL: 'http://127.0.0.1:4397' },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }, { name: 'webkit', use: { ...devices['Desktop Safari'] } }],
  webServer: { command: 'ASTRO_DEV_BACKGROUND=1 pnpm exec astro dev --root e2e/fixtures/astro-toaster --host 127.0.0.1 --port 4397', url: 'http://127.0.0.1:4397', reuseExistingServer: !process.env.CI },
})
