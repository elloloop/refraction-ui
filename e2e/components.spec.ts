import { test, expect } from '@playwright/test'

const components = [
  'button', 'input', 'textarea', 'dialog', 'badge', 'toast', 'tabs',
  'select', 'checkbox', 'switch', 'otp-input', 'skeleton', 'avatar',
  'calendar', 'tooltip', 'popover', 'collapsible', 'dropdown-menu',
  'command', 'card', 'navbar', 'sidebar-component', 'breadcrumbs', 'footer',
  'bottom-nav', 'data-table', 'progress-display', 'search-bar',
  'language-selector', 'version-selector', 'feedback-dialog',
  'inline-editor', 'video-player', 'markdown-renderer', 'code-editor',
  'slide-viewer', 'animated-text', 'date-picker', 'emoji-picker',
  'file-upload', 'avatar-group', 'presence-indicator', 'reaction-bar',
  'status-indicator', 'keyboard-shortcut', 'install-prompt',
  'content-protection', 'device-frame', 'segmented-control', 'separator',
  'voice-pill', 'waveform', 'password-input', 'social-auth-button',
  'rich-editor', 'logger',
]

for (const component of components) {
  test(`component: ${component}`, async ({ page }) => {
    await page.goto(`/components/${component}`)
    await page.waitForLoadState('networkidle')
    // Let on-demand route compilation, fonts, and syntax highlighting finish
    // before the stability check — CI is slow enough that a page can still be
    // morphing inside the screenshot window right after networkidle (this
    // flaked logger into "no two consecutive stable screenshots").
    await page.waitForFunction(() => document.fonts.status === 'loaded')
    await page.waitForTimeout(600)
    await expect(page).toHaveScreenshot(`component-${component}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
}
