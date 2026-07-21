import { test, expect, type Page } from '@playwright/test'

// Small settle after the UI reaches its target state, so CSS transitions
// (accordion expand, toast slide-in, tooltip fade) finish before capture.
const SETTLE_MS = 300

async function gotoComponent(page: Page, slug: string) {
  await page.goto(`/components/${slug}`)
  await page.waitForLoadState('networkidle')
  // Give React hydration a moment to attach handlers after the JS bundle lands
  // (Next dev compiles routes on demand, so networkidle can fire early).
  await page.waitForTimeout(SETTLE_MS)
}

// In dev the first click can land before hydration and be a no-op. Retry the
// action until the expected end state holds — like a user clicking again when
// nothing happens. The assertion itself is never relaxed.
async function retryUntil(action: () => Promise<void>, assertion: () => Promise<void>) {
  await expect(async () => {
    await action()
    await assertion()
  }).toPass({ timeout: 15_000 })
}

test('select: open listbox', async ({ page }) => {
  await gotoComponent(page, 'select')
  // The trigger's accessible name is empty (self-referencing aria-labelledby),
  // so target the first combobox in DOM order — the "With Placeholder" example.
  const trigger = page.getByRole('combobox').first()
  const listbox = page.getByRole('listbox')
  await retryUntil(
    () => trigger.click(),
    async () => {
      await expect(listbox).toBeVisible({ timeout: 2_000 })
      await expect(page.getByRole('option', { name: 'Apple' })).toBeVisible({ timeout: 2_000 })
    },
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-select-open.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})

test('popover: open', async ({ page }) => {
  await gotoComponent(page, 'popover')
  const trigger = page.getByRole('button', { name: 'Open Popover' })
  const content = page.getByRole('dialog')
  await retryUntil(
    () => trigger.click(),
    async () => {
      await expect(content).toBeVisible({ timeout: 2_000 })
      await expect(content).toContainText('Popover Title', { timeout: 2_000 })
    },
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-popover-open.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})

test('tooltip: visible after hover', async ({ page }) => {
  await gotoComponent(page, 'tooltip')
  // The "No delay" trigger has delayDuration={0}, so the tooltip shows at once.
  const trigger = page.getByRole('button', { name: 'No delay' })
  const tooltip = page.getByRole('tooltip')
  await retryUntil(
    async () => {
      // Move away first so a retry re-fires mouseenter.
      await page.mouse.move(0, 0)
      await trigger.hover()
    },
    async () => {
      await expect(tooltip).toBeVisible({ timeout: 2_000 })
      await expect(tooltip).toHaveText('Instant tooltip (no delay)', { timeout: 2_000 })
    },
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-tooltip-hover.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})

test('dropdown-menu: open', async ({ page }) => {
  await gotoComponent(page, 'dropdown-menu')
  // The page renders the "Open Menu" trigger more than once; the first in DOM
  // order is the live DropdownMenu example.
  const trigger = page.getByRole('button', { name: 'Open Menu' }).first()
  const menu = page.getByRole('menu')
  await retryUntil(
    () => trigger.click(),
    async () => {
      await expect(menu).toBeVisible({ timeout: 2_000 })
      await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible({ timeout: 2_000 })
    },
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-dropdown-menu-open.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})

test('switch: checked state', async ({ page }) => {
  await gotoComponent(page, 'switch')
  // First switch on the page is the unchecked "Small" size example.
  const switchEl = page.getByRole('switch').first()
  await expect(switchEl).toHaveAttribute('aria-checked', 'false')
  await retryUntil(
    () => switchEl.click(),
    () => expect(switchEl).toHaveAttribute('aria-checked', 'true', { timeout: 2_000 }),
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-switch-checked.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})

test('tabs: second tab selected', async ({ page }) => {
  await gotoComponent(page, 'tabs')
  const notificationsTab = page.getByRole('tab', { name: 'Notifications' })
  await retryUntil(
    () => notificationsTab.click(),
    async () => {
      await expect(notificationsTab).toHaveAttribute('aria-selected', 'true', { timeout: 2_000 })
      await expect(page.getByText('Notification Preferences')).toBeVisible({ timeout: 2_000 })
    },
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-tabs-second.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})

test('toast: visible after trigger', async ({ page }) => {
  await gotoComponent(page, 'toast')
  // "Persistent" uses duration: 0, so the toast stays until dismissed —
  // no race between the screenshot and an auto-dismiss timer.
  const trigger = page.getByRole('button', { name: 'Persistent' })
  // Next.js mounts its own role="alert" route announcer; filter to the toast.
  const toast = page.getByRole('alert').filter({ hasText: 'stays until dismissed' })
  await retryUntil(
    () => trigger.click(),
    () => expect(toast).toBeVisible({ timeout: 2_000 }),
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-toast-visible.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})

test('otp-input: partially filled', async ({ page }) => {
  await gotoComponent(page, 'otp-input')
  const digit1 = page.getByLabel('Digit 1 of 4').first()
  const digit2 = page.getByLabel('Digit 2 of 4').first()
  const digit3 = page.getByLabel('Digit 3 of 4').first()
  await retryUntil(
    async () => {
      await digit1.click()
      await page.keyboard.type('12')
    },
    async () => {
      await expect(digit1).toHaveValue('1', { timeout: 2_000 })
      await expect(digit2).toHaveValue('2', { timeout: 2_000 })
      await expect(digit3).toHaveValue('', { timeout: 2_000 })
    },
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-otp-input-partial.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})

test('password-input: revealed', async ({ page }) => {
  await gotoComponent(page, 'password-input')
  const input = page.getByPlaceholder('Enter password').first()
  // The toggle's label flips to "Hide password" after revealing, so match both
  // labels to keep the locator pointed at the same button.
  const toggle = page.getByRole('button', { name: /^(Show|Hide) password$/ }).first()
  await retryUntil(
    async () => {
      await input.fill('s3cret-horse')
      await toggle.click()
    },
    async () => {
      await expect(toggle).toHaveAttribute('aria-pressed', 'true', { timeout: 2_000 })
      await expect(input).toHaveAttribute('type', 'text', { timeout: 2_000 })
      await expect(input).toHaveValue('s3cret-horse', { timeout: 2_000 })
    },
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-password-input-revealed.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})

test('segmented-control: second segment selected', async ({ page }) => {
  await gotoComponent(page, 'segmented-control')
  // First sizes example defaults to "Left"; selecting "Center" (second segment)
  // is a real interaction.
  const center = page.getByRole('radio', { name: 'Center' }).first()
  await expect(center).toHaveAttribute('aria-checked', 'false')
  await retryUntil(
    () => center.click(),
    () => expect(center).toHaveAttribute('aria-checked', 'true', { timeout: 2_000 }),
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-segmented-control-second.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})

test('slide-viewer: on slide 2 after next', async ({ page }) => {
  await gotoComponent(page, 'slide-viewer')
  const next = page.getByRole('button', { name: 'Next slide' })
  await retryUntil(
    () => next.click(),
    () => expect(page.getByText('Key features overview')).toBeVisible({ timeout: 2_000 }),
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-slide-viewer-slide-2.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})

test('reaction-bar: after reacting', async ({ page }) => {
  await gotoComponent(page, 'reaction-bar')
  const thumbsUp = page.getByRole('button', { name: '👍 5 reactions' })
  await retryUntil(
    () => thumbsUp.click(),
    () =>
      expect(
        page.getByRole('button', { name: '👍 6 reactions, you reacted' }),
      ).toBeVisible({ timeout: 2_000 }),
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-reaction-bar-reacted.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})

test('accordion: expanded', async ({ page }) => {
  await gotoComponent(page, 'accordion')
  const trigger = page.getByRole('button', { name: 'Is it accessible?' })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await retryUntil(
    () => trigger.click(),
    async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'true', { timeout: 2_000 })
      await expect(
        page.getByText('Yes. It adheres to the WAI-ARIA design pattern for an accordion component.'),
      ).toBeVisible({ timeout: 2_000 })
    },
  )
  await page.waitForTimeout(SETTLE_MS)
  await expect(page).toHaveScreenshot('interaction-accordion-expanded.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  })
})
