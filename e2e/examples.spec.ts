import { test, expect } from '@playwright/test'

const hideDevOverlays = `
  nextjs-portal,
  [data-nextjs-dialog],
  [data-nextjs-dialog-overlay],
  [data-nextjs-toast],
  [data-nextjs-dev-tools],
  button[aria-label="Open Next.js Dev Tools"],
  button[aria-label="Open issues overlay"],
  button[aria-label="Collapse issues badge"] {
    display: none !important;
    visibility: hidden !important;
  }
`

async function hideNextDevTools(page: import('@playwright/test').Page) {
  await page.addStyleTag({ content: hideDevOverlays })
  await page.evaluate(() => {
    const labels = [
      'Open Next.js Dev Tools',
      'Open issues overlay',
      'Collapse issues badge',
    ]

    for (const label of labels) {
      const button = document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
      if (!button) continue

      let element: HTMLElement | null = button
      while (element && window.getComputedStyle(element).position !== 'fixed') {
        element = element.parentElement
      }
      const overlay = element ?? button
      overlay.style.display = 'none'
    }
  })
}

const examples = [
  { name: 'teamspace', pages: ['', '/app', '/app/channels'] },
  { name: 'cortex', pages: ['', '/app', '/app/settings'] },
  { name: 'momento', pages: ['', '/app', '/app/profile', '/app/explore'] },
  { name: 'grandview', pages: ['', '/app', '/app/booking'] },
  { name: 'maison', pages: ['', '/app', '/app/product'] },
  { name: 'ember', pages: ['', '/app', '/app/reservation'] },
  { name: 'verve', pages: ['', '/app', '/app/product', '/app/cart'] },
  { name: 'insightiq', pages: ['', '/app', '/app/settings'] },
  { name: 'vitalink', pages: ['', '/app', '/app/appointments'] },
  { name: 'learnhub', pages: ['', '/app', '/app/course'] },
  { name: 'clearbank', pages: ['', '/app', '/app/transfer'] },
  { name: 'studiox', pages: ['', '/app', '/app/project'] },
]

for (const example of examples) {
  for (const pagePath of example.pages) {
    const testName = `example: ${example.name}${pagePath || ' (landing)'}`
    test(testName, async ({ page }) => {
      await page.goto(`/examples/${example.name}${pagePath}`)
      await page.waitForLoadState('networkidle')
      await hideNextDevTools(page)
      await expect(page).toHaveScreenshot(
        `example-${example.name}${pagePath.replace(/\//g, '-') || '-landing'}.png`,
        { fullPage: true, maxDiffPixelRatio: 0.01 }
      )
    })
  }
}
