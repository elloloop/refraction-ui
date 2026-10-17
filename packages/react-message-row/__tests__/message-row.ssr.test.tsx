import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { JSDOM } from 'jsdom'
import { MessageRow, type MessageRowAction, type MessageRowProps } from '../src/index.js'

const noop = () => {}
const icon = <svg data-testid="glyph" />

const ACTIONS: MessageRowAction[] = [
  { icon, label: 'Reply', onSelected: noop },
  { icon, label: 'React', onSelected: noop },
  { icon, label: 'Edit', onSelected: noop },
  { icon, label: 'Copy link', onSelected: noop },
  { icon, label: 'Delete', onSelected: noop, destructive: true },
]

function render(props: Partial<MessageRowProps> = {}) {
  return renderToString(
    <MessageRow authorName="Ana Lima" timestamp="10:42" body="Ship it on Friday?" {...props} />,
  )
}

/** Parse the SSR string so assertions can follow id references. */
function parse(html: string): Document {
  // Parsing only: the render itself is a node-env renderToString.
  return new JSDOM(html).window.document
}

function labelFromLabelledBy(doc: Document): string {
  const row = doc.querySelector('[role="article"]')!
  const ids = row.getAttribute('aria-labelledby')!.split(' ')
  return ids.map((id) => doc.getElementById(id)?.textContent ?? `<missing ${id}>`).join(' ')
}

describe('MessageRow (SSR)', () => {
  it('renders one article named by author, time and text', () => {
    const doc = parse(render())
    const rows = doc.querySelectorAll('[role="article"]')
    expect(rows).toHaveLength(1)
    expect(rows[0].hasAttribute('aria-label')).toBe(false)
    expect(labelFromLabelledBy(doc)).toBe('Ana Lima 10:42 Ship it on Friday?')
  })

  it('appends the edited marker to the label', () => {
    const doc = parse(render({ editedLabel: '(edited)' }))
    expect(labelFromLabelledBy(doc)).toBe('Ana Lima 10:42 Ship it on Friday? (edited)')
  })

  it('names rich bodies by their rendered text', () => {
    const doc = parse(
      render({
        body: (
          <>
            See <a href="https://example.com">the plan</a>
          </>
        ),
      }),
    )
    expect(labelFromLabelledBy(doc)).toBe('Ana Lima 10:42 See the plan')
  })

  it('uses semanticLabel as an aria-label override', () => {
    const doc = parse(render({ semanticLabel: 'Ana at 10:42: Ship it' }))
    const row = doc.querySelector('[role="article"]')!
    expect(row.getAttribute('aria-label')).toBe('Ana at 10:42: Ship it')
    expect(row.hasAttribute('aria-labelledby')).toBe(false)
  })

  it('keeps the body selectable and in the tree', () => {
    const doc = parse(render())
    const body = doc.querySelector('[data-message-row-body]')!
    expect(body.textContent).toBe('Ship it on Friday?')
    expect(body.className).toContain('select-text')
    expect(body.closest('[aria-hidden="true"]')).toBeNull()
  })

  it('lead row shows avatar and name', () => {
    const doc = parse(render({ avatar: <img alt="" src="a.png" /> }))
    expect(doc.querySelector('img')).not.toBeNull()
    const author = doc.querySelector('[id$="-author"]')!
    expect(author.className).not.toContain('sr-only')
    expect(doc.querySelector('[data-continuation]')).toBeNull()
  })

  it('continuation hides avatar and name visually but keeps them in the label', () => {
    const doc = parse(render({ continuation: true, avatar: <img alt="" src="a.png" /> }))
    expect(doc.querySelector('img')).toBeNull()
    expect(doc.querySelector('[data-continuation]')).not.toBeNull()
    expect(doc.querySelector('[id$="-author"]')!.className).toContain('sr-only')
    // Time is hidden with opacity until hover/focus, never removed.
    const time = doc.querySelector('[id$="-time"]')!
    expect(time.parentElement!.className).toContain('opacity-0')
    expect(labelFromLabelledBy(doc)).toBe('Ana Lima 10:42 Ship it on Friday?')
  })

  it('sizes the avatar gutter in rem from avatarSize', () => {
    const html = render({ avatarSize: 48, avatar: <img alt="" src="a.png" /> })
    expect(html).toContain('width:3rem')
  })

  it('renders the quote, labels, status and footer slots', () => {
    const doc = parse(
      render({
        quote: <span>Replying to Ben</span>,
        labels: <span>Forwarded · Ben</span>,
        status: <span>Read</span>,
        footer: <span>3 replies</span>,
      }),
    )
    const text = doc.body.textContent
    for (const part of ['Replying to Ben', 'Forwarded · Ben', 'Read', '3 replies']) expect(text).toContain(part)
    // The reply preview is not part of the row's name.
    expect(labelFromLabelledBy(doc)).not.toContain('Replying to Ben')
  })

  it('renders a toolbar with inline actions and an overflow menu button', () => {
    const doc = parse(render({ actions: ACTIONS }))
    const toolbar = doc.querySelector('[role="toolbar"]')!
    expect(toolbar.getAttribute('aria-label')).toBe('Message actions')
    expect(toolbar.getAttribute('data-state')).toBe('hidden')
    const labels = Array.from(toolbar.querySelectorAll('button')).map((b) => b.getAttribute('aria-label'))
    expect(labels).toEqual(['Reply', 'React', 'Edit', 'More actions'])
    const more = toolbar.querySelector('button[aria-label="More actions"]')!
    expect(more.getAttribute('aria-haspopup')).toBe('menu')
    expect(more.getAttribute('aria-expanded')).toBe('false')
  })

  it('honours maxInlineActions and skips the menu when everything fits', () => {
    const doc = parse(render({ actions: ACTIONS.slice(0, 2), maxInlineActions: 2 }))
    expect(doc.querySelector('button[aria-label="More actions"]')).toBeNull()
    expect(doc.querySelectorAll('[role="toolbar"] button')).toHaveLength(2)
  })

  it('marks destructive inline actions', () => {
    const doc = parse(render({ actions: [ACTIONS[4]] }))
    const del = doc.querySelector('button[aria-label="Delete"]')!
    expect(del.hasAttribute('data-destructive')).toBe(true)
    expect(del.className).toContain('text-destructive')
  })

  it('renders the leading slot inside the toolbar', () => {
    const doc = parse(render({ toolbarLeading: <button type="button">👍</button> }))
    expect(doc.querySelector('[role="toolbar"]')!.textContent).toContain('👍')
  })

  it('has no toolbar without actions or a leading slot', () => {
    expect(parse(render()).querySelector('[role="toolbar"]')).toBeNull()
  })

  it('tombstone shows the text and drops actions and extra slots', () => {
    const doc = parse(
      render({
        tombstone: true,
        actions: ACTIONS,
        toolbarLeading: <button type="button">👍</button>,
        quote: 'quoted',
        footer: 'footer',
        editedLabel: '(edited)',
        labels: 'Forwarded',
        status: 'Read',
      }),
    )
    expect(doc.querySelector('[data-tombstone]')).not.toBeNull()
    expect(doc.querySelector('[role="toolbar"]')).toBeNull()
    expect(doc.querySelector('button')).toBeNull()
    const text = doc.body.textContent!
    for (const part of ['quoted', 'footer', '(edited)', 'Forwarded', 'Read', 'Ship it']) expect(text).not.toContain(part)
    expect(labelFromLabelledBy(doc)).toBe('Ana Lima 10:42 This message was deleted')
  })

  it('accepts custom tombstone text', () => {
    expect(render({ tombstone: true, tombstoneText: 'Removed by an admin' })).toContain('Removed by an admin')
  })

  it('renders a highlight overlay for a jump target', () => {
    const doc = parse(render({ highlighted: true }))
    expect(doc.querySelector('[data-highlight="on"]')).not.toBeNull()
    const overlay = doc.querySelector('[data-message-row-highlight]')!
    expect(overlay.getAttribute('aria-hidden')).toBe('true')
    expect(overlay.className).toContain('ring-inset')
    expect(parse(render()).querySelector('[data-message-row-highlight]')).toBeNull()
  })

  it('is focusable (with the focus ring) only when it has a tap action', () => {
    const tappable = parse(render({ onTap: noop })).querySelector('[role="article"]')!
    expect(tappable.getAttribute('tabindex')).toBe('0')
    expect(tappable.className).toContain('focus-visible:ring-2')
    expect(parse(render()).querySelector('[role="article"]')!.hasAttribute('tabindex')).toBe(false)
  })

  it('passes className and native attributes through', () => {
    const doc = parse(render({ className: 'custom', 'data-message-id': 'm1' } as Partial<MessageRowProps>))
    const row = doc.querySelector('[role="article"]')!
    expect(row.className).toContain('custom')
    expect(row.getAttribute('data-message-id')).toBe('m1')
  })
})
