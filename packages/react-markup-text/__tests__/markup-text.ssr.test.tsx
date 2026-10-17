import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { MarkupText, parseMarkupText, MARKUP_TEXT_LINK_REL } from '../src/index.js'

/** Strip React's text-boundary comments so assertions read like the DOM text. */
function html(ui: React.ReactElement): string {
  return renderToString(ui).replace(/<!-- -->/g, '')
}

let errorSpy: ReturnType<typeof vi.spyOn>
let warnSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  resetDevFeedback()
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
  errorSpy.mockRestore()
  warnSpy.mockRestore()
})

describe('MarkupText (SSR) — markup mode', () => {
  it('renders a span root with data attributes by default', () => {
    const out = html(<MarkupText text="Hello" />)
    expect(out).toMatch(/^<span[^>]*data-slot="markup-text"/)
    expect(out).toContain('data-mode="markup"')
    expect(out).toContain('>Hello</span>')
  })

  it('renders bold runs as one <strong> per run with strongClassName', () => {
    const out = html(<MarkupText text="Open **Settings** now" strongClassName="text-primary" />)
    expect(out).toContain('Open <strong class="font-semibold text-primary">Settings</strong> now')
  })

  it('replaces tokens with inline nodes, inside bold runs too', () => {
    const out = html(
      <MarkupText text="**Press {key}** to save" inline={{ key: <kbd>⌘S</kbd> }} />,
    )
    expect(out).toContain('<strong class="font-semibold">Press <kbd>⌘S</kbd></strong> to save')
  })

  it('accepts string and null inline nodes without reporting them missing', () => {
    const out = html(<MarkupText text="Hi {name}{gap}!" inline={{ name: 'Ann', gap: null }} />)
    expect(out).toContain('Hi Ann!')
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('never renders a token without a node raw, and reports it in development', () => {
    const out = html(<MarkupText text="Press {missing} now" />)
    expect(out).not.toContain('{')
    expect(out).not.toContain('missing')
    expect(out).toContain('Press  now')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(String(errorSpy.mock.calls[0]?.[0])).toContain('markup-text/missing-inline-node:missing')
  })

  it('does not treat inherited object keys as inline nodes', () => {
    const out = html(<MarkupText text="{constructor}" inline={{}} />)
    expect(out).not.toContain('function')
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('renders inline code', () => {
    expect(html(<MarkupText text="Run `pnpm i`" />)).toContain('Run <code class="')
    expect(html(<MarkupText text="Run `pnpm i`" />)).toContain('>pnpm i</code>')
  })

  it('renders escaped braces literally', () => {
    expect(html(<MarkupText text={'\\{literal\\}'} />)).toContain('{literal}')
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('does not auto-link in markup mode', () => {
    expect(html(<MarkupText text="https://example.com" />)).not.toContain('<a')
  })

  it.each([
    ['span', /^<span/],
    ['p', /^<p/],
    ['div', /^<div/],
  ] as const)('renders as %s', (as, pattern) => {
    expect(html(<MarkupText as={as} text="x" />)).toMatch(pattern)
  })

  it('maps textAlign to a block-level alignment class and merges className', () => {
    const out = html(<MarkupText text="x" textAlign="center" className="text-sm" />)
    expect(out).toContain('block text-center')
    expect(out).toContain('text-sm')
  })

  it('passes through HTML attributes', () => {
    const out = html(<MarkupText text="x" id="step-1" aria-describedby="hint" />)
    expect(out).toContain('id="step-1"')
    expect(out).toContain('aria-describedby="hint"')
  })
})

describe('MarkupText (SSR) — message mode', () => {
  it('auto-links URLs with a safe rel, a new-tab target and a screen-reader hint', () => {
    const out = html(<MarkupText mode="message" text="See https://example.com." />)
    expect(out).toContain('data-mode="message"')
    expect(out).toContain('href="https://example.com/"')
    expect(out).toContain(`rel="${MARKUP_TEXT_LINK_REL}"`)
    expect(out).toContain('target="_blank"')
    expect(out).toContain('<span class="sr-only"> (opens in a new tab)</span></a>.')
  })

  it('honours linkTarget="_self" and drops the new-tab hint', () => {
    const out = html(<MarkupText mode="message" linkTarget="_self" text="https://example.com" />)
    expect(out).toContain('target="_self"')
    expect(out).not.toContain('sr-only')
  })

  it('localises the new-tab hint', () => {
    const out = html(<MarkupText mode="message" newTabLabel="(neues Fenster)" text="https://example.com" />)
    expect(out).toContain(' (neues Fenster)')
  })

  it('renders mailto links without a target', () => {
    const out = html(<MarkupText mode="message" text="mailto:ann@example.com" />)
    expect(out).toContain('href="mailto:ann@example.com"')
    expect(out).not.toContain('target=')
  })

  it.each(['javascript:alert(1)', 'data:text/html,hi', 'vbscript:msgbox(1)'])(
    'renders %s as plain text, never a link',
    (url) => {
      const out = html(<MarkupText mode="message" text={`click ${url}`} />)
      expect(out).not.toContain('<a')
      expect(out).not.toContain('href')
    },
  )

  it('escapes HTML in message text instead of injecting it', () => {
    const out = html(<MarkupText mode="message" text={'<img src=x onerror="alert(1)">'} />)
    expect(out).not.toContain('<img')
    expect(out).toContain('&lt;img')
  })

  it('renders mention chips from ranges as non-interactive spans by default', () => {
    const out = html(
      <MarkupText mode="message" text="hi @ann" mentions={[{ id: 'u1', start: 3, end: 7, type: 'user' }]} />,
    )
    expect(out).toMatch(/<span class="[^"]*bg-accent[^"]*" data-slot="markup-text-mention" data-mention-id="u1" data-mention-type="user">@ann<\/span>/)
    expect(out).not.toContain('<button')
  })

  it('renders mention chips as buttons when onMentionClick is given', () => {
    const out = html(
      <MarkupText
        mode="message"
        text="hi @ann"
        mentions={[{ id: 'u1', start: 3, end: 7 }]}
        onMentionClick={() => undefined}
      />,
    )
    expect(out).toMatch(/<button type="button" class="[^"]*focus-visible:ring-2[^"]*"[^>]*>@ann<\/button>/)
  })

  it('does not interpret braces as tokens in message mode', () => {
    const out = html(<MarkupText mode="message" text="use {foo}" />)
    expect(out).toContain('use {foo}')
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('warns once in development about dropped mention ranges', () => {
    html(<MarkupText mode="message" text="hi" mentions={[{ id: 'x', start: 0, end: 99 }]} />)
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(String(warnSpy.mock.calls[0]?.[0])).toContain('markup-text/invalid-mention-range')
  })

  it('re-exports the pure parser for composing components', () => {
    expect(parseMarkupText('**a**')).toEqual([{ type: 'text', text: 'a', strong: true }])
  })
})
