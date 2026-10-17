import { describe, it, expect } from 'vitest'
import { appShellSidebarToggleStyles } from '../src/app-shell.styles.js'

describe('AppShell styles', () => {
  it('gives the sidebar toggle a keyboard focus ring', () => {
    expect(appShellSidebarToggleStyles.split(/\s+/)).toEqual(
      expect.arrayContaining(['focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring']),
    )
  })
})
