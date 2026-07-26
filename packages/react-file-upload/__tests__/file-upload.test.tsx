import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { FileUpload } from '../src/file-upload.js'

// SSR suite — structure and ARIA only. Drag & drop, file selection, the file
// list, progress bars, and removal are client interactions (drag events,
// input change, store updates) not covered here; the headless add/validate
// logic is covered by packages/file-upload's core tests.

describe('FileUpload (React)', () => {
  it('renders a hidden file input', () => {
    const html = renderToString(React.createElement(FileUpload, null))
    expect(html).toContain('type="file"')
    expect(html).toContain('display:none')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('tabindex="-1"')
  })

  it('renders the drop zone as a focusable button with an accessible label', () => {
    const html = renderToString(React.createElement(FileUpload, null))
    expect(html).toContain('role="button"')
    expect(html).toContain('aria-label="Drop files here or click to upload"')
    expect(html).toContain('tabindex="0"')
  })

  it('renders the default drop-zone content', () => {
    const html = renderToString(React.createElement(FileUpload, null))
    expect(html).toContain('📁')
    expect(html).toContain('Drag &amp; drop files here, or click to select')
  })

  it('maps accept onto the input and the hint text', () => {
    const html = renderToString(React.createElement(FileUpload, { accept: 'image/*' }))
    expect(html).toContain('accept="image/*"')
    expect(html).toContain('Accepted: image/*')
  })

  it('shows the formatted max size hint', () => {
    const html = renderToString(React.createElement(FileUpload, { maxSize: 10 * 1024 * 1024 }))
    expect(html).toContain('Max size: 10.0 MB')
  })

  it('maps multiple onto the input', () => {
    const html = renderToString(React.createElement(FileUpload, { multiple: true }))
    expect(html).toContain('multiple=""')
    expect(renderToString(React.createElement(FileUpload, null))).not.toContain('multiple')
  })

  it('replaces the default content with custom children', () => {
    const html = renderToString(
      React.createElement(
        FileUpload,
        null,
        React.createElement('p', null, 'Drop your résumé'),
      ),
    )
    expect(html).toContain('Drop your résumé')
    expect(html).not.toContain('Drag &amp; drop files here')
  })

  it('appends a custom className to the root', () => {
    const html = renderToString(React.createElement(FileUpload, { className: 'my-upload' }))
    expect(html).toContain('my-upload')
  })

  it('renders no file list before any files are added', () => {
    const html = renderToString(React.createElement(FileUpload, null))
    expect(html).not.toContain('Remove ')
  })
})
