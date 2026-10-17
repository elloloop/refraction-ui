import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { DiffViewer } from '../src/DiffViewer.js'
import type { DiffFile } from '@refraction-ui/diff-viewer'

// Text sized in rem follows the reader's browser text-size setting; a pixel
// size would stay fixed.
const PIXEL_TEXT = /\btext-\[\d+(?:\.\d+)?px\]/

const files: DiffFile[] = [
  { path: 'src/alpha.ts', status: 'modified', additions: 3, deletions: 1 },
  { path: 'src/deep/beta.ts', status: 'added', additions: 2, deletions: 1 },
]

describe('DiffViewer text size (React SSR)', () => {
  it.each(['dark', 'light'] as const)('renders no pixel text sizes in the %s theme', (theme) => {
    const html = renderToString(React.createElement(DiffViewer, { files, theme }))
    expect(html).not.toMatch(PIXEL_TEXT)
  })

  it('sizes the file tree heading and file metadata in rem', () => {
    const html = renderToString(React.createElement(DiffViewer, { files }))
    expect(html).toContain('text-[0.6875rem]')
    expect(html).toContain('text-[0.625rem]')
  })
})
