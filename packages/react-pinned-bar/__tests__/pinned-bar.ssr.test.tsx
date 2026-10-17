import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { PinnedBar, type PinnedBarItem, type PinnedBarProps } from '../src/index.js'

const ITEMS: PinnedBarItem[] = [
  { id: 'a', author: 'Ada Lovelace', snippet: 'Standup moved to 10:30.' },
  { id: 'b', author: 'Grace Hopper', snippet: 'Release checklist is in the wiki.' },
  { id: 'c', author: 'Alan Turing', snippet: 'Please review the migration plan.' },
]

const noop = () => {}

function render(props: Partial<PinnedBarProps> = {}) {
  return renderToString(<PinnedBar items={ITEMS} {...props} />)
}

/** Text content with tags stripped, for assertions that ignore markup. */
function text(html: string) {
  return html.replace(/<[^>]+>/g, '')
}

describe('PinnedBar (SSR)', () => {
  it('is a region named "Pinned messages"', () => {
    const html = render()
    expect(html).toMatch(/<div[^>]*role="region"[^>]*aria-label="Pinned messages"/)
  })

  it('names the region from labels.region', () => {
    const html = render({ labels: { region: 'Pins in #general' } })
    expect(html).toContain('aria-label="Pins in #general"')
  })

  it('shows the current pin author, snippet and position', () => {
    const html = render({ defaultIndex: 1 })
    expect(text(html)).toContain('Grace Hopper')
    expect(text(html)).toContain('Release checklist is in the wiki.')
    expect(text(html)).toContain('2 of 3')
    expect(text(html)).not.toContain('Ada Lovelace')
  })

  it('honours a controlled index and clamps an out-of-range one', () => {
    expect(text(render({ index: 2 }))).toContain('3 of 3')
    expect(text(render({ index: 99 }))).toContain('Alan Turing')
  })

  it('formats the position with labels.position', () => {
    expect(text(render({ labels: { position: (c, t) => `${c}/${t}` } }))).toContain('1/3')
  })

  it('truncates the snippet to one line while keeping its full text in the DOM', () => {
    const long = 'word '.repeat(80).trim()
    const html = render({ items: [{ id: 'x', author: 'Ada', snippet: long }] })
    expect(html).toContain(long)
    expect(html).toMatch(/class="[^"]*\btruncate\b[^"]*">word word/)
  })

  it('renders previous and next only when there is more than one pin', () => {
    const many = render()
    expect(many).toContain('aria-label="Previous pinned message"')
    expect(many).toContain('aria-label="Next pinned message"')

    const one = render({ items: [ITEMS[0]] })
    expect(one).not.toContain('Previous pinned message')
    expect(one).not.toContain('Next pinned message')
    expect(text(one)).toContain('1 of 1')
  })

  it('renders open-list and unpin only when their handlers are given', () => {
    const bare = render()
    expect(bare).not.toContain('Show all pinned messages')
    expect(bare).not.toContain('Unpin message')

    const full = render({ onOpenList: noop, onUnpin: noop })
    expect(full).toContain('aria-label="Show all pinned messages"')
    expect(full).toContain('aria-label="Unpin message"')
  })

  it('makes the snippet a button described by the position only when onOpen is given', () => {
    const plain = render()
    expect(plain).not.toMatch(/<button[^>]*aria-describedby=/)

    const html = render({ onOpen: noop })
    const positionId = html.match(/<span id="([^"]+)"[^>]*>1 of 3<\/span>/)?.[1]
    expect(positionId).toBeTruthy()
    expect(html).toMatch(
      new RegExp(`<button type="button"[^>]*aria-describedby="${positionId}"[^>]*><span[^>]*>Ada Lovelace`),
    )
  })

  it('gives the snippet button a 44px minimum height and a visible focus ring', () => {
    const html = render({ onOpen: noop })
    const cls = html.match(/<button type="button" class="([^"]+)"[^>]*aria-describedby/)?.[1] ?? ''
    expect(cls).toContain('min-h-11')
    expect(cls).toContain('focus-visible:ring-2')
    expect(cls).toContain('motion-reduce:transition-none')
  })

  it('has a collapse disclosure toggle wired with aria-expanded and aria-controls', () => {
    const html = render()
    const contentId = html.match(/<div id="([^"]+)" class="[^"]*\bflex\b/)?.[1]
    expect(contentId).toBeTruthy()
    expect(html).toMatch(
      new RegExp(
        `<button[^>]*aria-label="Collapse pinned messages"[^>]*aria-controls="${contentId}"[^>]*aria-expanded="true"`,
      ),
    )
    expect(html).toContain('data-state="expanded"')
  })

  it('when collapsed hides the content and shows a count summary instead', () => {
    const html = render({ defaultCollapsed: true })
    expect(html).toContain('data-state="collapsed"')
    expect(html).toMatch(/<div id="[^"]+" class="[^"]*\bhidden\b[^"]*" hidden="">/)
    expect(text(html)).toContain('3 pinned messages')
    expect(html).toMatch(/aria-label="Expand pinned messages"[^>]*aria-expanded="false"/)
  })

  it('renders an empty polite live region on first render', () => {
    const html = render()
    expect(html).toMatch(
      /<div class="sr-only" role="status" aria-live="polite" aria-atomic="true"><\/div>/,
    )
  })

  it('hides the decorative pin glyph', () => {
    expect(render()).toMatch(/<span class="[^"]*" aria-hidden="true"><svg/)
  })

  it('renders nothing when there are no pins', () => {
    expect(render({ items: [] })).toBe('')
  })

  it('forwards className and DOM props to the root', () => {
    const html = render({ className: 'custom-bar', id: 'pins' })
    expect(html).toMatch(/<div[^>]*class="[^"]*custom-bar"/)
    expect(html).toContain('id="pins"')
  })
})
