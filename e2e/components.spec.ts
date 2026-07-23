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
    // Deterministic settle: fonts loaded and every CodeBlock finished its
    // async shiki highlight (code-block.tsx flips data-highlighted to 'true'
    // only after codeToHtml resolves). On slow CI a code-heavy page (logger
    // is ~10k px of code blocks) is still morphing after networkidle, which
    // makes the two-consecutive-stable-screenshots check impossible.
    await page.waitForFunction(() => document.fonts.status === 'loaded')
    await page.waitForFunction(
      () => document.querySelectorAll('[data-highlighted="pending"]').length === 0,
      undefined,
      { timeout: 30000 },
    )
    await expect(page).toHaveScreenshot(`component-${component}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
}
