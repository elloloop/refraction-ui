import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { ImageViewer, type ImageViewerImage } from '../src/index.js'

// SSR structure + ARIA (node env). These prove the rendered shape only; the
// gestures and keys are covered by the jsdom interaction suite.

const images: ImageViewerImage[] = [
  { src: '/one.png', alt: 'Build log screenshot', caption: 'CI run #42', width: 1600, height: 900 },
  { src: '/two.png', alt: 'Error dialog' },
  { src: '/three.png', alt: 'Settings page' },
]

function render(ui: React.ReactElement) {
  return renderToString(ui)
}

describe('ImageViewer SSR', () => {
  it('renders nothing while closed', () => {
    expect(render(<ImageViewer images={images} />)).not.toContain('role="dialog"')
  })

  it('renders a labelled modal dialog when open', () => {
    const html = render(<ImageViewer images={images} defaultOpen />)
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
    expect(html).toContain('aria-label="Image viewer"')
    expect(html).toContain('data-zoomed="false"')
    expect(html).toContain('data-index="0"')
  })

  it('renders the image with its alt text inside a figure with its caption', () => {
    const html = render(<ImageViewer images={images} defaultOpen />)
    expect(html).toMatch(/<figure[^>]*>[\s\S]*<img[^>]*alt="Build log screenshot"[\s\S]*<figcaption[^>]*>CI run #42<\/figcaption>/)
    expect(html).toContain('src="/one.png"')
    expect(html).toContain('draggable="false"')
  })

  it('omits the caption when the image has none', () => {
    const html = render(<ImageViewer images={images} defaultIndex={1} defaultOpen />)
    expect(html).toContain('alt="Error dialog"')
    expect(html).not.toContain('<figcaption')
  })

  it('names every icon control', () => {
    const html = render(<ImageViewer images={images} defaultOpen />)
    for (const label of ['Close', 'Zoom out', 'Zoom in', 'Reset zoom', 'Previous image', 'Next image']) {
      expect(html).toContain(`aria-label="${label}"`)
    }
  })

  it('marks controls at their limit aria-disabled (not disabled, so focus stays)', () => {
    const html = render(<ImageViewer images={images} defaultOpen />)
    expect(html).toMatch(/aria-label="Zoom out"[^>]*aria-disabled="true"|aria-disabled="true"[^>]*aria-label="Zoom out"/)
    expect(html).toMatch(/aria-label="Previous image"[^>]*aria-disabled="true"|aria-disabled="true"[^>]*aria-label="Previous image"/)
    expect(html).not.toMatch(/aria-label="Next image"[^>]*aria-disabled|aria-disabled="true"[^>]*aria-label="Next image"/)
    expect(html).not.toMatch(/<button[^>]*\sdisabled=""/)
  })

  it('enables previous at the first image when looping', () => {
    const html = render(<ImageViewer images={images} defaultOpen loop />)
    expect(html).not.toMatch(/aria-label="Previous image"[^>]*aria-disabled|aria-disabled="true"[^>]*aria-label="Previous image"/)
  })

  it('shows the position and the zoom readout', () => {
    const html = render(<ImageViewer images={images} defaultIndex={1} defaultOpen />)
    expect(html).toContain('Image 2 of 3')
    expect(html).toContain('100%')
  })

  it('renders an empty polite live region (filled once mounted)', () => {
    const html = render(<ImageViewer images={images} defaultOpen />)
    expect(html).toMatch(/<div role="status" aria-live="polite" aria-atomic="true" class="sr-only"><\/div>/)
  })

  it('hides the position and previous / next for a single image', () => {
    const html = render(<ImageViewer images={[images[0]]} defaultOpen />)
    expect(html).not.toContain('Image 1 of 1')
    expect(html).not.toContain('Previous image')
    expect(html).not.toContain('Next image')
  })

  it('renders the actions slot, as nodes or as a function of the current image', () => {
    const asNode = render(
      <ImageViewer images={images} defaultOpen actions={<a href="/one.png" download>Download</a>} />,
    )
    expect(asNode).toContain('download=""')
    const asFn = render(
      <ImageViewer
        images={images}
        defaultIndex={2}
        defaultOpen
        actions={(image, index) => <span data-action="">{`${image.alt} at ${index}`}</span>}
      />,
    )
    expect(asFn).toContain('Settings page at 2')
  })

  it('applies label overrides', () => {
    const html = render(
      <ImageViewer
        images={images}
        defaultOpen
        labels={{ dialog: 'Visionneuse', close: 'Fermer', position: (i, n) => `${i} sur ${n}` }}
      />,
    )
    expect(html).toContain('aria-label="Visionneuse"')
    expect(html).toContain('aria-label="Fermer"')
    expect(html).toContain('1 sur 3')
  })

  it('clamps an out-of-range index', () => {
    const html = render(<ImageViewer images={images} index={9} open />)
    expect(html).toContain('alt="Settings page"')
    expect(html).toContain('Image 3 of 3')
  })

  it('forwards className and DOM props to the dialog', () => {
    const html = render(<ImageViewer images={images} defaultOpen className="custom-viewer" data-testid="viewer" />)
    expect(html).toContain('custom-viewer')
    expect(html).toContain('data-testid="viewer"')
  })

  it('renders the trigger as the dialog opener', () => {
    const html = render(<ImageViewer images={images} trigger={<button type="button">Open</button>} />)
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain('aria-expanded="false"')
  })

  it('uses fixed touch handling and no transition by default on the image', () => {
    const html = render(<ImageViewer images={images} defaultOpen />)
    expect(html).toContain('touch-none')
    expect(html).toMatch(/<img[^>]*class="[^"]*transition-none/)
    expect(html).toContain('transform:translate(0px, 0px) scale(1)')
  })
})
