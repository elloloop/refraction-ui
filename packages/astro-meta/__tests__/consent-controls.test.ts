import { describe, expect, it } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import ConsentControls from './fixtures/consent-controls.astro'

describe('published Astro consent controls', () => {
  it('imports and renders cards, inputs and radio choices through the public meta', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(ConsentControls)
    expect(html).toContain('Review access')
    expect(html).toContain('Choose an agent.')
    expect(html).toContain('type="email"')
    expect(html).toContain('id="email"')
    expect(html).toContain('required')
    expect(html).toContain('Example agent')
    expect(html).toContain('No access is granted automatically.')
  })
})
