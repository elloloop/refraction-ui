import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './packages/flutter/browser_test',
  outputDir: './e2e/results/flutter',
  timeout: 90_000,
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:7357', trace: 'retain-on-failure' },
  webServer: {
    command: 'python3 -m http.server 7357 --bind 127.0.0.1 --directory packages/flutter/example/build/web',
    url: 'http://127.0.0.1:7357',
    reuseExistingServer: false,
  },
});
