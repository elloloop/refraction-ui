import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // The client script drives the DOM, so its tests run in jsdom. The
    // Playwright specs in browser_test/ run against a real browser instead.
    environment: 'jsdom',
    include: ['__tests__/**/*.test.ts'],
  },
})
