import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@refraction-ui/shared'
import type { ComposerTrigger } from '@refraction-ui/composer'
import { RefractionComposer, type RefractionComposerProps } from '../src/index.js'

const render = (props: RefractionComposerProps = {}) =>
  renderToString(React.createElement(RefractionComposer, props))

const mentionTrigger: ComposerTrigger = {
  id: 'mention',
  symbol: '@',
  resolve: () => [
    { id: 'u1', display: 'Alice Chen' },
    { id: 'u2', display: 'Bob Marley' },
  ],
}

describe('RefractionComposer (SSR)', () => {
  it('G1 renders textarea with aria-multiline, aria-label, placeholder, and no aria-expanded without triggers', () => {
    const html = render({ placeholder: 'Send a message…' })
    expect(html).toContain('<textarea')
    expect(html).toContain('aria-multiline="true"')
    expect(html).toContain('aria-label="Message"')
    expect(html).toContain('placeholder="Send a message…"')
    expect(html).not.toContain('aria-expanded')
    // form landmark labelled by the composer string
    expect(html).toContain('role="form"')
    expect(html).toContain('aria-label="Message composer"')
  })

  it('G2 disabled renders the disabled attribute and the disabledPlaceholder', () => {
    const html = render({
      disabled: true,
      placeholder: 'Send a message…',
      disabledPlaceholder: 'Messaging is turned off',
    })
    expect(html).toContain('disabled=""')
    expect(html).toContain('placeholder="Messaging is turned off"')
    expect(html).not.toContain('placeholder="Send a message…"')
  })

  it('G3 combobox wiring is present (and deterministic) when triggers are configured', () => {
    const html = render({ id: 'cmp', triggers: [mentionTrigger] })
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-autocomplete="list"')
    expect(html).toContain('aria-controls="cmp-listbox"')
    // Closed menu: the listbox itself and activedescendant are absent.
    expect(html).not.toContain('role="listbox"')
    expect(html).not.toContain('aria-activedescendant')
  })

  it('G4 send/stop labels and the near-limit counter as one contiguous string', () => {
    const idle = render({})
    expect(idle).toContain('aria-label="Send"')
    expect(idle).not.toContain('characters remaining')

    const busyHtml = render({ busy: true })
    expect(busyHtml).toContain('aria-label="Stop"')
    expect(busyHtml).not.toContain('aria-label="Send"')

    // maxLength 10, 8 graphemes used → remaining 2 (≤ 20% budget) → visible.
    const nearLimit = render({ maxLength: 10, defaultValue: '12345678' })
    expect(nearLimit).toContain('2 characters remaining')
  })

  it('G5 attachment chips render the name and a labelled remove button', () => {
    const html = render({
      initialAttachments: [{ kind: 'file', name: 'report.pdf', sizeBytes: 1024 }],
    })
    expect(html).toContain('report.pdf')
    expect(html).toContain('aria-label="Remove attachment report.pdf"')
  })

  it('G6 dir passes through and layout classes stay logical (no left/right literals)', () => {
    const html = render({ dir: 'rtl', maxLength: 10, defaultValue: '12345678' })
    expect(html).toContain('dir="rtl"')
    expect(html).not.toMatch(/class="[^"]*\bleft-\d/)
    expect(html).not.toMatch(/class="[^"]*\bright-\d/)
    expect(html).not.toMatch(/class="[^"]*\bml-\d/)
    expect(html).not.toMatch(/class="[^"]*\bmr-\d/)
    expect(html).not.toMatch(/class="[^"]*\bpl-\d/)
    expect(html).not.toMatch(/class="[^"]*\bpr-\d/)
  })

  it('G7 hydration determinism: identical markup for identical config', () => {
    const props: RefractionComposerProps = {
      triggers: [mentionTrigger],
      placeholder: 'Write…',
      maxLength: 100,
      defaultValue: 'hello',
      initialAttachments: [{ kind: 'image', name: 'photo.png' }],
    }
    resetIdCounter()
    const first = render(props)
    resetIdCounter()
    const second = render(props)
    expect(first).toBe(second)
  })

  it('G8 renders in bare node without touching browser globals', () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')
    const html = render({ triggers: [mentionTrigger], defaultValue: 'hi @a' })
    expect(html).toContain('<textarea')
    // suggestion menu is closed at create time (hydration-deterministic)
    expect(html).toContain('aria-expanded="false"')
  })
})
