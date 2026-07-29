import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { DiffViewer } from '../src/DiffViewer.js'
import type { DiffFile } from '@refraction-ui/diff-viewer'

// SSR suite — structure and ARIA only. The Monaco editor is lazy-loaded, so
// SSR renders the Suspense fallback; editor behavior, keyboard navigation
// (j/k/b), and click-to-select are client-only interactions not covered here.

// Totals: 5 additions / 2 deletions across 3 files — the status-bar strings
// `+5 -2` and `3 files` must render contiguously (regression guard for the
// template-literal SSR fix; adjacent `{a} {b}` expressions used to be split by
// `<!-- -->` comment separators).
const files: DiffFile[] = [
  { path: 'src/alpha.ts', status: 'modified', additions: 3, deletions: 1 },
  { path: 'src/deep/beta.ts', status: 'added', additions: 2, deletions: 1 },
  { path: 'README.md', status: 'deleted', additions: 0, deletions: 0 },
]

function renderViewer(props: Record<string, unknown> = {}) {
  return renderToString(React.createElement(DiffViewer, { files, ...props }))
}

describe('DiffViewer (React)', () => {
  it('renders a region with an accessible label', () => {
    const html = renderViewer()
    expect(html).toContain('role="region"')
    expect(html).toContain('aria-label="Diff viewer"')
  })

  it('exposes view mode, theme, and file count as data attributes', () => {
    const html = renderViewer()
    expect(html).toContain('data-view-mode="side-by-side"')
    expect(html).toContain('data-theme="dark"')
    expect(html).toContain('data-file-count="3"')
  })

  it('renders the status-bar totals as a contiguous string', () => {
    const html = renderViewer()
    // Regression guard: must not be split by SSR comment nodes (`+5 <!-- -->-2`).
    expect(html).toContain('+5 -2')
    expect(html).not.toContain('+5 <!-- -->-2')
  })

  it('renders the file count as a contiguous pluralized string', () => {
    const html = renderViewer()
    expect(html).toContain('3 files')
    expect(html).not.toContain('3<!-- --> files')
  })

  it('singularizes the file count for a single file', () => {
    const html = renderViewer({ files: [files[0]] })
    expect(html).toContain('1 file')
    expect(html).not.toContain('1 files')
  })

  it('renders the sidebar with every file name and per-file stats', () => {
    const html = renderViewer()
    expect(html).toContain('alpha.ts')
    expect(html).toContain('beta.ts')
    expect(html).toContain('README.md')
    // Directory shown for nested paths.
    expect(html).toContain('src/deep')
    // Per-file stat spans: additions for all 3 files, deletions only where > 0.
    // NOTE: the sidebar composes these as adjacent expressions (`+{n}`), which
    // SSR splits with `<!-- -->` comments — the same bug class the status-bar
    // template literals fixed. Known residual issue; not asserted contiguously.
    expect(html.match(/text-green-500/g)?.length).toBe(3)
    expect(html.match(/text-red-500/g)?.length).toBe(2)
  })

  it('hides the sidebar when showSidebar is false', () => {
    const html = renderViewer({ showSidebar: false })
    expect(html).not.toContain('Files (')
  })

  it('renders the tab bar with a tab per file', () => {
    const html = renderViewer()
    // File names appear in both sidebar and tabs.
    expect(html.match(/alpha\.ts/g)?.length).toBeGreaterThanOrEqual(2)
  })

  it('hides the tab bar when showTabs is false', () => {
    // Without the status bar (which prints the active file's full path), each
    // file name should appear exactly once — in the sidebar.
    const html = renderViewer({ showTabs: false, showStatusBar: false })
    expect(html.match(/alpha\.ts/g)?.length).toBe(1)
  })

  it('hides the status bar when showStatusBar is false', () => {
    const html = renderViewer({ showStatusBar: false })
    expect(html).not.toContain('+5 -2')
    expect(html).not.toContain('3 files')
  })

  it('renders the active file path and optional title/status in the status bar', () => {
    const html = renderViewer({
      activeFileIndex: 1,
      statusBarTitle: 'Review',
      statusBarStatus: '2 comments',
    })
    expect(html).toContain('Review')
    expect(html).toContain('2 comments')
    expect(html).toContain('src/deep/beta.ts')
  })

  it('reflects the theme and view-mode props in data attributes', () => {
    const html = renderViewer({ theme: 'light', viewMode: 'inline' })
    expect(html).toContain('data-theme="light"')
    expect(html).toContain('data-view-mode="inline"')
  })

  it('appends a custom className to the root', () => {
    const html = renderViewer({ className: 'my-diff' })
    expect(html).toContain('my-diff')
  })

  it('renders the editor Suspense fallback during SSR', () => {
    const html = renderViewer()
    expect(html).toContain('Loading editor...')
  })
})
