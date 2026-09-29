import { test, expect } from '@playwright/test'

test('theme editor hydrates and opens its composed dialog trigger without browser errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/theme/editor')
  await page.waitForLoadState('networkidle')
  const trigger = page.getByRole('button', { name: 'Open Dialog', exact: true })
  await expect(trigger).toHaveCount(1)
  await expect(trigger.locator('button')).toHaveCount(0)
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Confirm Action' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('id', (await trigger.getAttribute('aria-controls'))!)
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  expect(errors).toEqual([])
})
