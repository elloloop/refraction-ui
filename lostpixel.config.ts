import type { Page } from '@playwright/test'
import { checkVisualFonts } from './scripts/check-visual-fonts.mjs'

checkVisualFonts()

export const config = {
  // Concurrent route builds animate the Next badge on every open page.
  // Preserve the badge/error UI, but capture only after this route is idle.
  shotConcurrency: 1,
  beforeScreenshot: async (page: Page) => {
    await page.evaluate(() => document.fonts.ready.then(() => undefined))
    await page.locator('nextjs-portal [data-next-mark-loading="false"]').first().waitFor()
    if (await page.locator('nextjs-portal [data-next-badge][data-error="true"]').count()) {
      throw new Error('Next.js reported an error before the visual capture')
    }
  },
  pageShots: {
    pages: [
      // Component pages
      { path: '/components/button', name: 'component-button' },
      { path: '/components/input', name: 'component-input' },
      { path: '/components/dialog', name: 'component-dialog' },
      { path: '/components/badge', name: 'component-badge' },
      { path: '/components/toast', name: 'component-toast' },
      { path: '/components/tabs', name: 'component-tabs' },
      { path: '/components/select', name: 'component-select' },
      { path: '/components/card', name: 'component-card' },
      { path: '/components/avatar', name: 'component-avatar' },
      { path: '/components/checkbox', name: 'component-checkbox' },
      { path: '/components/switch', name: 'component-switch' },
      // Example landing pages
      { path: '/examples/teamspace', name: 'example-teamspace' },
      { path: '/examples/cortex', name: 'example-cortex' },
      { path: '/examples/momento', name: 'example-momento' },
      { path: '/examples/grandview', name: 'example-grandview' },
      { path: '/examples/maison', name: 'example-maison' },
      { path: '/examples/ember', name: 'example-ember' },
      { path: '/examples/verve', name: 'example-verve' },
      { path: '/examples/insightiq', name: 'example-insightiq' },
      { path: '/examples/vitalink', name: 'example-vitalink' },
      { path: '/examples/learnhub', name: 'example-learnhub' },
      { path: '/examples/clearbank', name: 'example-clearbank' },
      // A breakpoint emits a full-page shot without expanding viewport height.
      // Lost Pixel 3.22 drops page.viewport from its generated shot item.
      { path: '/examples/studiox', name: 'example-studiox', breakpoints: [1280] },
      // Theme page
      { path: '/theme', name: 'theme-playground' },
      { path: '/theme/editor', name: 'theme-editor' },
      { path: '/', name: 'homepage' },
    ],
    baseUrl: 'http://localhost:3000',
  },
  // Local baseline comparison must stay enabled in CI: Lost Pixel 3.x
  // only exits nonzero for differences when generateOnly is true.
  generateOnly: true,
  failOnDifference: true,
  // Threshold
  threshold: 0.1,
  // Where to store baselines
  imagePathBaseline: '.lostpixel/baseline',
  imagePathCurrent: '.lostpixel/current',
  imagePathDifference: '.lostpixel/difference',
}
