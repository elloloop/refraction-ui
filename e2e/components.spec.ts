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
    // async shiki highlight. code-block.tsx flips data-highlighted to 'true'
    // only after codeToHtml resolves — and pre-hydration there are no marked
    // blocks at all, so the check must ALSO require at least one 'true'
    // block (waiting for zero pendings alone passes trivially too early).
    await page.waitForFunction(() => document.fonts.status === 'loaded')
    await page.waitForFunction(
      () =>
        document.querySelectorAll('[data-highlighted="pending"]').length === 0 &&
        document.querySelectorAll('[data-highlighted="true"]').length > 0,
      undefined,
      { timeout: 30000 },
    )
    // Belt-and-braces stabilization: code-heavy pages (logger is ~10k px of
    // shiki blocks) can keep morphing after the highlight pass (framework
    // context swaps re-highlight blocks post-hydration). Require the body
    // DOM to be byte-identical across 800 ms before the screenshot — the
    // assertion itself is unchanged.
    await page.waitForFunction(
      async () => {
        const hash = (s: string) => {
          let h = 0
          for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
          return h
        }
        const before = hash(document.body.innerHTML)
        await new Promise((r) => setTimeout(r, 800))
        return before === hash(document.body.innerHTML)
      },
      undefined,
      { timeout: 30000, polling: 400 },
    )
    await expect(page).toHaveScreenshot(`component-${component}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
}
