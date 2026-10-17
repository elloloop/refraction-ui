import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { FileCard } from '../src/index.js'

const html = (ui: React.ReactElement) => renderToString(ui)

/** Count non-overlapping occurrences of `needle` in `haystack`. */
const count = (haystack: string, needle: string) => haystack.split(needle).length - 1

describe('FileCard (SSR)', () => {
  it('renders the name, kind and size as text', () => {
    const out = html(<FileCard name="spec.pdf" mimeType="application/pdf" size={2.4 * 1024 * 1024} />)
    expect(out).toContain('spec.pdf')
    expect(out).toContain('PDF · 2.4 MB')
    expect(out).toContain('data-state="done"')
    expect(out).toContain('data-kind="pdf"')
  })

  it('is not interactive without onOpen or href', () => {
    const out = html(<FileCard name="a.txt" />)
    expect(out).not.toContain('<button')
    expect(out).not.toContain('<a ')
    expect(out).toContain('title="a.txt"')
  })

  it('renders a native button with the name as its title when onOpen is given', () => {
    const out = html(<FileCard name="a.txt" onOpen={() => {}} />)
    const button = /<button[^>]*data-file-card-open[^>]*>/.exec(out)?.[0] ?? ''
    expect(button).toContain('type="button"')
    expect(button).toContain('title="a.txt"')
    expect(out).toContain('data-file-card-open')
  })

  it('renders a link for href, with safe rel for new tabs', () => {
    const out = html(<FileCard name="a.txt" href="/files/a.txt" target="_blank" />)
    expect(out).toMatch(/<a[^>]*href="\/files\/a.txt"/)
    expect(out).toContain('target="_blank"')
    expect(out).toContain('rel="noopener noreferrer"')
  })

  it('drops a javascript: href instead of rendering a link', () => {
    const out = html(<FileCard name="a.txt" href="javascript:alert(1)" />)
    expect(out).not.toContain('<a ')
    expect(out).not.toContain('javascript:')
  })

  it('keeps the full name for AT and as a tooltip when visually truncated', () => {
    const name = 'quarterly-financial-report-final.pdf'
    const out = html(<FileCard name={name} maxNameLength={24} onOpen={() => {}} />)
    expect(out).toContain('<span aria-hidden="true">quarterly-…ort-final.pdf</span>')
    expect(out).toContain(`<span class="sr-only">${name}</span>`)
    expect(out).toContain(`title="${name}"`)
  })

  it('describes the open control with the metadata and status', () => {
    const out = html(<FileCard name="a.txt" onOpen={() => {}} />)
    const describedBy = /<button[^>]*aria-describedby="([^"]+)"/.exec(out)?.[1]
    expect(describedBy).toBeDefined()
    const [metaId, statusId] = describedBy!.split(' ')
    expect(out).toContain(`id="${metaId}"`)
    expect(out).toMatch(new RegExp(`id="${statusId}"[^>]*role="status"`))
  })

  it('never nests action buttons inside the open control', () => {
    const out = html(<FileCard name="a.txt" onOpen={() => {}} onDownload={() => {}} />)
    const openButton = /<button[^>]*data-file-card-open[^>]*>([\s\S]*?)<\/button>/.exec(out)?.[1] ?? ''
    expect(openButton).not.toContain('<button')
    expect(count(out, '<button')).toBe(2)
  })

  describe('uploading', () => {
    it('renders a determinate progress bar with value and text', () => {
      const out = html(<FileCard name="a.zip" status="uploading" progress={45} onCancel={() => {}} />)
      expect(out).toContain('role="progressbar"')
      expect(out).toContain('aria-valuenow="45"')
      expect(out).toContain('aria-valuemin="0"')
      expect(out).toContain('aria-valuemax="100"')
      expect(out).toContain('aria-valuetext="45%"')
      expect(out).toContain('aria-label="Uploading a.zip"')
      expect(out).toContain('width:45%')
      expect(out).toContain('Uploading · 45%')
      expect(out).toContain('aria-label="Cancel upload"')
    })

    it('makes the progress animation static under reduced motion', () => {
      const determinate = html(<FileCard name="a" status="uploading" progress={10} />)
      expect(determinate).toContain('motion-reduce:transition-none')
      const indeterminate = html(<FileCard name="a" status="uploading" />)
      expect(indeterminate).toContain('animate-pulse')
      expect(indeterminate).toContain('motion-reduce:animate-none')
      expect(indeterminate).not.toContain('aria-valuenow')
    })

    it('omits cancel without onCancel', () => {
      const out = html(<FileCard name="a" status="uploading" progress={10} />)
      expect(out).not.toContain('Cancel upload')
    })
  })

  describe('failed', () => {
    it('shows the error text, an icon and a retry button', () => {
      const out = html(<FileCard name="a.png" status="failed" error="Network lost" onRetry={() => {}} />)
      expect(out).toContain('data-state="failed"')
      expect(out).toContain('Network lost')
      expect(out).toContain('aria-label="Retry upload"')
      expect(out).toContain('border-destructive')
      expect(out).not.toContain('role="progressbar"')
    })

    it('announces the failure in the status live region', () => {
      const out = html(<FileCard name="a.png" status="failed" />)
      expect(out).toMatch(/role="status"[^>]*>Upload failed<\/span>/)
    })
  })

  describe('done', () => {
    it('shows the download action only when done', () => {
      expect(html(<FileCard name="a" onDownload={() => {}} />)).toContain('aria-label="Download"')
      expect(html(<FileCard name="a" status="uploading" onDownload={() => {}} />)).not.toContain(
        'aria-label="Download"',
      )
    })

    it('describes icon actions with the file name', () => {
      const out = html(<FileCard name="a.txt" onDownload={() => {}} />)
      const nameId = /id="([^"]+)" title="a.txt"/.exec(out)?.[1]
      expect(nameId).toBeDefined()
      expect(out).toMatch(new RegExp(`aria-label="Download"[^>]*aria-describedby="${nameId}"|aria-describedby="${nameId}"[^>]*aria-label="Download"`))
    })
  })

  it('renders the actions slot', () => {
    const out = html(<FileCard name="a" actions={<a href="/a" download>Save</a>} />)
    expect(out).toContain('download=""')
    expect(out).toContain('Save')
  })

  it('shows duration and pixel size', () => {
    const out = html(
      <FileCard name="clip.mp4" size={1024} duration={125} dimensions={{ width: 1280, height: 720 }} />,
    )
    expect(out).toContain('Video · 1 KB · 2:05 · 1,280 × 720')
  })

  it('uses a custom icon in place of the kind glyph', () => {
    const out = html(<FileCard name="a.png" icon={<img src="/t.png" alt="" />} />)
    expect(out).toContain('src="/t.png"')
  })

  it('localises labels and numbers', () => {
    const out = html(
      <FileCard
        name="bericht.pdf"
        size={1536}
        locale="de-DE"
        labels={{ download: 'Herunterladen', kinds: { pdf: 'PDF-Datei' } }}
        onDownload={() => {}}
      />,
    )
    expect(out).toContain('PDF-Datei · 1,5 KB')
    expect(out).toContain('aria-label="Herunterladen"')
  })

  it('merges className and forwards attributes to the root', () => {
    const out = html(<FileCard name="a" className="custom" data-testid="card" />)
    expect(out).toMatch(/<div[^>]*class="[^"]*custom[^"]*"/)
    expect(out).toContain('data-testid="card"')
  })

  it('gives the open control a visible focus ring', () => {
    const out = html(<FileCard name="a" onOpen={() => {}} />)
    expect(out).toContain('focus-visible:after:ring-2')
    expect(out).toContain('focus-visible:after:ring-ring')
  })
})
