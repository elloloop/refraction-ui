import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import Field from '../dist/astro-field/Field.astro'

/**
 * Field rendered from the meta's dist, as consumers get it. Astro pads slot
 * output with whitespace, so order checks compare positions, not strings.
 */
async function render(
  props: Record<string, unknown>,
  control = '<input id="email" />',
): Promise<string> {
  const container = await AstroContainer.create()
  return container.renderToString(
    Field as Parameters<AstroContainer['renderToString']>[0],
    { props, slots: { default: control } },
  )
}

describe('astro-field', () => {
  it('labels the slotted control by htmlFor', async () => {
    const html = await render({ label: 'Email', htmlFor: 'email' })
    expect(html).toContain('data-slot="field"')
    expect(html).toContain('data-layout="stacked"')
    expect(html).toMatch(/<label[^>]*for="email"[^>]*>Email<\/label>/)
    expect(html).toContain('<input id="email"')
    expect(html.indexOf('<label')).toBeLessThan(html.indexOf('<input'))
  })

  it('renders the hint with the id the control describes itself by', async () => {
    const html = await render(
      { label: 'Email', htmlFor: 'email', hint: 'We never share it.' },
      '<input id="email" aria-describedby="email-hint" />',
    )
    expect(html).toMatch(/<p[^>]*id="email-hint"[^>]*>We never share it\.<\/p>/)
  })

  it('omits the hint when there is none', async () => {
    const html = await render({ label: 'Email', htmlFor: 'email' })
    expect(html).not.toContain('data-slot="field-hint"')
  })

  it('puts the control before the label in the inline layout', async () => {
    const html = await render(
      { label: 'Show archived', htmlFor: 'archived', layout: 'inline', hint: 'Closed items too.' },
      '<input type="checkbox" id="archived" />',
    )
    expect(html).toContain('data-layout="inline"')
    expect(html.indexOf('<input')).toBeLessThan(html.indexOf('<label'))
    expect(html.match(/<input/g)).toHaveLength(1)
    expect(html).toMatch(/<p[^>]*class="[^"]*col-start-2/)
  })

  it('applies the eyebrow label, grow and a consumer class', async () => {
    const html = await render({
      label: 'Status',
      htmlFor: 'email',
      labelTone: 'eyebrow',
      grow: true,
      class: 'extra',
    })
    expect(html).toMatch(/<label[^>]*class="[^"]*uppercase/)
    expect(html).toMatch(/<div[^>]*class="[^"]*flex-1[^"]*extra/)
  })
})
