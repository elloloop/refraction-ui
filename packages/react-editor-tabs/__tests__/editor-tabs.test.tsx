import { describe, it, expect, vi } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { EditorTabs } from '../src/editor-tabs.js'
import type { EditorTabData } from '../src/editor-tabs.js'

const render = (props: Partial<EditorTabsProps> & { tabs: EditorTabData[]; activeId: string }) =>
  renderToString(
    React.createElement(EditorTabs, {
      onSelect: vi.fn(),
      ...props,
    }),
  )

// Re-use the exported type in this file.
type EditorTabsProps = React.ComponentProps<typeof EditorTabs>

const baseTabs: EditorTabData[] = [
  { id: 'solution', label: 'solution.py' },
  { id: 'tests', label: 'tests.py' },
  { id: 'notes', label: 'notes.md' },
]

describe('EditorTabs (SSR)', () => {
  it('renders role=tablist with N role=tab children', () => {
    const html = render({ tabs: baseTabs, activeId: 'solution' })
    expect(html).toContain('role="tablist"')
    expect((html.match(/role="tab"/g) ?? []).length).toBe(3)
  })

  it('marks the active tab with aria-selected="true"', () => {
    const html = render({ tabs: baseTabs, activeId: 'tests' })
    // Only one tab should be selected.
    expect((html.match(/aria-selected="true"/g) ?? []).length).toBe(1)
    // The selected tab contains the label of the active tab.
    const selectedMatch = html.match(/aria-selected="true"[^>]*>.*?tests\.py/s)
    expect(selectedMatch).toBeTruthy()
  })

  it('renders dirty dot when tab.dirty is true', () => {
    const tabs: EditorTabData[] = [
      { id: 'a', label: 'a.py', dirty: true },
      { id: 'b', label: 'b.py' },
    ]
    const html = render({ tabs, activeId: 'a' })
    expect(html).toContain('aria-label="unsaved changes"')
  })

  it('renders close button when tab.closable is true', () => {
    const tabs: EditorTabData[] = [
      { id: 'a', label: 'a.py', closable: true },
      { id: 'b', label: 'b.py' },
    ]
    const html = render({ tabs, activeId: 'a' })
    expect(html).toContain('aria-label="Close a.py"')
  })

  it('does not render dirty dot when dirty is false', () => {
    const tabs: EditorTabData[] = [{ id: 'a', label: 'a.py', dirty: false }]
    const html = render({ tabs, activeId: 'a' })
    expect(html).not.toContain('aria-label="unsaved changes"')
  })

  it('renders optional icon when provided', () => {
    const tabs: EditorTabData[] = [{ id: 'a', label: 'a.py', icon: '🐍' }]
    const html = render({ tabs, activeId: 'a' })
    expect(html).toContain('🐍')
  })
})
