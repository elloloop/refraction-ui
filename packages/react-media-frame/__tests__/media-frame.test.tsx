import { describe, it, expect, vi, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { MediaFrame, type MediaFrameProps } from '../src/index.js'

const render = (props: MediaFrameProps) => renderToString(React.createElement(MediaFrame, props))

/** The opening tag of the first element carrying `data-slot="<slot>"`. */
function tag(html: string, slot: string): string {
  const open = html.match(new RegExp(`<[a-z]+\\b[^>]*data-slot="${slot}"[^>]*>`))?.[0]
  if (!open) throw new Error(`no ${slot} in ${html}`)
  return open
}

afterEach(() => {
  vi.restoreAllMocks()
  resetDevFeedback()
})

describe('MediaFrame (SSR)', () => {
  it('renders its media, a caption and its orientation', () => {
    const html = render({
      ratio: '9:16',
      label: '1080×1920',
      children: <img alt="poster" src="poster.png" />,
    })
    const root = tag(html, 'media-frame')
    expect(root).toContain('data-orientation="portrait"')
    expect(root).toContain('aspect-ratio:0.5625')
    expect(html).toContain('<img alt="poster" src="poster.png"/>')
    expect(html).toMatch(/<span[^>]*data-slot="media-frame-label"[^>]*>1080×1920<\/span>/)
    expect(html.indexOf('<img')).toBeLessThan(html.indexOf('media-frame-label'))
  })

  it('is a square on the neutral surface by default, with no caption', () => {
    const html = render({})
    const root = tag(html, 'media-frame')
    expect(root).toContain('data-orientation="square"')
    expect(root).toContain('aspect-ratio:1')
    expect(root).toContain('bg-muted')
    expect(html).not.toContain('media-frame-label')
  })

  it('treats false as no caption but keeps a zero', () => {
    expect(render({ label: false })).not.toContain('media-frame-label')
    expect(render({ label: 0 })).toMatch(/media-frame-label[^>]*>0<\/span>/)
  })

  it('puts the caption in the requested logical corner', () => {
    const html = render({ label: '00:09', labelPosition: 'bottom-end' })
    const caption = tag(html, 'media-frame-label')
    expect(caption).toContain('bottom-1.5')
    expect(caption).toContain('end-1.5')
  })

  it('applies the tertiary tone to the frame and the caption', () => {
    const html = render({ tone: 'tertiary', label: 'PNG' })
    expect(tag(html, 'media-frame')).toContain('bg-tertiary')
    expect(tag(html, 'media-frame-label')).toContain('text-tertiary-foreground')
  })

  it('merges className and style and passes other attributes through', () => {
    const html = render({
      ratio: 2,
      className: 'w-60 rounded-lg',
      style: { maxHeight: 200 },
      'aria-label': 'Preview',
      id: 'preview',
    })
    const root = tag(html, 'media-frame')
    expect(root).toMatch(/class="[^"]*border-border-subtle[^"]*w-60 rounded-lg"/)
    expect(root).toContain('aspect-ratio:2;max-height:200px')
    expect(root).toContain('aria-label="Preview"')
    expect(root).toContain('id="preview"')
  })

  it('lets a style override the computed aspect ratio', () => {
    const root = tag(render({ ratio: 2, style: { aspectRatio: 'auto' } }), 'media-frame')
    expect(root).toContain('aspect-ratio:auto')
    expect(root).not.toContain('aspect-ratio:2')
  })

  it('warns once and falls back to a square for an unusable ratio', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const html = render({ ratio: '16:0' as MediaFrameProps['ratio'] })
    render({ ratio: '0:0' as MediaFrameProps['ratio'] })
    expect(tag(html, 'media-frame')).toContain('aspect-ratio:1')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0][0])).toContain('react-media-frame/invalid-ratio')
  })

  it('does not warn for a usable ratio', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render({ ratio: '4 / 3' })
    expect(warn).not.toHaveBeenCalled()
  })
})
