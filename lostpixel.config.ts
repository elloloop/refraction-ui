import { CustomShot, PageScreenshotParameter } from 'lost-pixel'

export const config = {
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
      { path: '/examples/studiox', name: 'example-studiox' },
      // Theme page
      { path: '/theme', name: 'theme-playground' },
      { path: '/theme/editor', name: 'theme-editor' },
      { path: '/', name: 'homepage' },
    ],
    baseUrl: 'http://localhost:3000',
  },
  // Store baselines in repo
  generateOnly: process.env.CI !== 'true',
  failOnDifference: true,
  // Threshold
  threshold: 0.1,
  // Where to store baselines
  imagePathBaseline: '.lostpixel/baseline',
  imagePathCurrent: '.lostpixel/current',
  imagePathDifference: '.lostpixel/difference',
}
