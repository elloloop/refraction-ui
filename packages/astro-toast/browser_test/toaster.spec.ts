import { test, expect, type Page } from '@playwright/test'

// The Astro Toaster in a real browser: keyboard use, the focus ring, focus
// hand-back, the action, and what the live regions announce.

interface Announcement {
  politeness: string | null
  text: string
}

declare global {
  interface Window {
    __announcements: Announcement[]
  }
}

/**
 * Record every line added to a toaster live region. A line is removed again
 * about a second later, so asserting on the live DOM would race it.
 */
async function recordAnnouncements(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__announcements = []
    new MutationObserver((records) => {
      for (const record of records) {
        const region = (record.target as Element).closest?.('[data-rfr-toast-announcer]')
        if (!region) continue
        record.addedNodes.forEach((node) => {
          window.__announcements.push({
            politeness: region.getAttribute('data-rfr-toast-announcer'),
            text: node.textContent ?? '',
          })
        })
      }
    }).observe(document, { childList: true, subtree: true })
  })
}

const announcements = (page: Page) => page.evaluate(() => window.__announcements)

async function hasFocusRing(page: Page, name: string): Promise<boolean> {
  const control = page.getByRole('button', { name, exact: true })
  return control.evaluate((el) => el.matches(':focus-visible') && getComputedStyle(el).boxShadow !== 'none')
}

/**
 * The keys that move focus to the next and previous control. Safari's Tab
 * skips buttons unless the user turns on "Press Tab to highlight each item";
 * Option-Tab always reaches them.
 */
function focusKeys(browserName: string): { next: string; previous: string } {
  return browserName === 'webkit'
    ? { next: 'Alt+Tab', previous: 'Alt+Shift+Tab' }
    : { next: 'Tab', previous: 'Shift+Tab' }
}

test.beforeEach(async ({ page }) => {
  await recordAnnouncements(page)
})

test('a toast with a title and an action is reachable and usable from the keyboard', async ({ page, browserName }) => {
  const keys = focusKeys(browserName)
  await page.goto('/')
  const notifications = page.getByRole('region', { name: 'Notifications' })
  const trigger = page.getByRole('button', { name: 'Save', exact: true })
  const deleteDraft = page.getByRole('button', { name: 'Delete draft' })

  await deleteDraft.focus()
  await page.keyboard.press('Enter')
  const toast = notifications.locator('[data-rfr-toast]').filter({ hasText: 'Draft deleted' })
  await expect(toast).toBeVisible()
  await expect(toast).toContainText('It is no longer in your drafts.')
  // Inside the toaster the toast is not an alert of its own.
  await expect(toast).not.toHaveAttribute('role', 'alert')

  // Tab from the last trigger into the toaster: the action, then the dismiss button.
  await trigger.focus()
  await page.keyboard.press(keys.next)
  await expect(toast.getByRole('button', { name: 'Undo' })).toBeFocused()
  expect(await hasFocusRing(page, 'Undo')).toBe(true)
  await page.keyboard.press(keys.next)
  await expect(toast.getByRole('button', { name: 'Dismiss' })).toBeFocused()
  expect(await hasFocusRing(page, 'Dismiss')).toBe(true)

  // Back to the action and choose it: the toast closes, the action runs once,
  // and focus goes back to where it was before it entered the toaster.
  await page.keyboard.press(keys.previous)
  await page.keyboard.press('Enter')
  await expect(toast).toHaveCount(0)
  await expect(page.locator('#restored')).toHaveText('1')
  await expect(trigger).toBeFocused()

  expect(await announcements(page)).toEqual([
    { politeness: 'polite', text: 'Draft deleted. It is no longer in your drafts. Undo' },
  ])
})

test('Escape closes the focused toast and focus returns to where it came from', async ({ page, browserName }) => {
  const keys = focusKeys(browserName)
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Save', exact: true })
  await page.getByRole('button', { name: 'Upload file' }).click()
  const toast = page.locator('[data-rfr-toast]').filter({ hasText: 'Upload failed' })
  await expect(toast).toBeVisible()

  await trigger.focus()
  await page.keyboard.press(keys.next)
  await expect(toast.getByRole('button', { name: 'Dismiss' })).toBeFocused()
  await page.keyboard.press('Escape')

  await expect(toast).toHaveCount(0)
  await expect(trigger).toBeFocused()
  expect(await announcements(page)).toEqual([{ politeness: 'assertive', text: 'Upload failed' }])
})

test('a toast holding focus waits, and closes on its own once focus leaves', async ({ page, browserName }) => {
  const keys = focusKeys(browserName)
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Save', exact: true })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const toast = page.locator('[data-rfr-toast]').filter({ hasText: 'Saved' })
  await expect(toast).toBeVisible()

  // Its duration is 1.5s; while it holds focus it stays well past that.
  await page.keyboard.press(keys.next)
  await expect(toast.getByRole('button', { name: 'Dismiss' })).toBeFocused()
  await page.waitForTimeout(2_500)
  await expect(toast).toBeVisible()

  await page.keyboard.press(keys.previous)
  await expect(trigger).toBeFocused()
  await expect(toast).toHaveCount(0, { timeout: 5_000 })
})

test('a server-rendered toast is announced by the toaster and its action dispatches an event', async ({ page }) => {
  await page.goto('/server')
  const toast = page.getByRole('region', { name: 'Notifications' }).locator('[data-rfr-toast]')
  await expect(toast).toBeVisible()
  await expect(toast).not.toHaveAttribute('role', 'alert')
  await expect
    .poll(() => announcements(page))
    .toEqual([{ politeness: 'polite', text: 'Signed in. Welcome back. View profile' }])

  await toast.getByRole('button', { name: 'View profile' }).click()
  await expect(page.locator('#last-action')).toHaveText('Signed in')
  await expect(toast).toHaveCount(0)
})
