import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // The client script drives the DOM, so its tests run in jsdom.
    environment: 'jsdom',
    include: ['__tests__/**/*.test.ts'],
  },
})
