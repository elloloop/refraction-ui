import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import MediaFrame from '../dist/astro-media-frame/MediaFrame.astro'

/** MediaFrame rendered from the meta's dist, as consumers get it. */
async function render(props: Record<string, unknown>, media = ''): Promise<string> {
  const container = await AstroContainer.create()
  return container.renderToString(
    MediaFrame as Parameters<AstroContainer['renderToString']>[0],
    { props, slots: media ? { default: media } : {} },
  )
}

/** The opening tag of the first element carrying `data-slot="<slot>"`. */
function tag(html: string, slot: string): string {
  const open = html.match(new RegExp(`<[a-z]+\\b[^>]*data-slot="${slot}"[^>]*>`))?.[0]
  if (!open) throw new Error(`no ${slot} in ${html}`)
  return open
}

describe('astro-media-frame', () => {
  it('renders the slotted media in a frame of the requested ratio', async () => {
    const html = await render({ ratio: '9:16' }, '<img alt="poster" src="poster.png">')
    const root = tag(html, 'media-frame')
    expect(root).toContain('data-orientation="portrait"')
    expect(root).toContain('aspect-ratio:0.5625')
    expect(html).toContain('alt="poster"')
  })

  it('is a square on the neutral surface by default, with no caption', async () => {
    const html = await render({})
    const root = tag(html, 'media-frame')
    expect(root).toContain('data-orientation="square"')
    expect(root).toContain('aspect-ratio:1')
    expect(root).toContain('bg-muted')
    expect(html).not.toContain('media-frame-label')
  })

  it('places a caption in the requested logical corner', async () => {
    const html = await render({ label: '00:09', labelPosition: 'bottom-end' })
    const caption = tag(html, 'media-frame-label')
    expect(caption).toContain('bottom-1.5')
    expect(caption).toContain('end-1.5')
    expect(html).toMatch(/media-frame-label[^>]*>00:09<\/span>/)
  })

  it('applies the tertiary tone, a consumer class and a trailing style', async () => {
    const html = await render({
      tone: 'tertiary',
      ratio: 2,
      class: 'w-60',
      style: 'max-height:200px',
      id: 'preview',
    })
    const root = tag(html, 'media-frame')
    expect(root).toMatch(/class="[^"]*bg-tertiary[^"]*w-60"/)
    expect(root).toContain('style="aspect-ratio:2;max-height:200px"')
    expect(root).toContain('id="preview"')
  })

  it('falls back to a square for an unusable ratio', async () => {
    const root = tag(await render({ ratio: '16:0' }), 'media-frame')
    expect(root).toContain('aspect-ratio:1')
    expect(root).toContain('data-orientation="square"')
  })
})
