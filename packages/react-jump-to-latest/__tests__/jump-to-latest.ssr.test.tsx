import { describe, it, expect, vi } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  JumpToLatest,
  useJumpToLatest,
  type JumpToLatestController,
  type JumpToLatestProps,
} from '../src/index.js'

function controller(overrides: Partial<JumpToLatestController> = {}): JumpToLatestController {
  return {
    atEnd: false,
    newCount: 0,
    firstUnreadKey: null,
    firstUnreadIndex: null,
    jump: vi.fn(),
    jumpToFirstUnread: vi.fn(),
    getScrollElement: () => null,
    ...overrides,
  }
}

function render(props: Partial<JumpToLatestProps> & { controller: JumpToLatestController }) {
  return renderToString(<JumpToLatest {...props} />)
}

function parse(html: string): { button: string; region: string } {
  const button = html.match(/<button[^>]*>/)?.[0] ?? ''
  const region = html.match(/<span[^>]*role="status"[^>]*>/)?.[0] ?? ''
  return { button, region }
}

describe('JumpToLatest (SSR)', () => {
  it('renders a native button with the new-item count', () => {
    const html = render({ controller: controller({ newCount: 3 }) })
    const { button } = parse(html)
    expect(button).toContain('type="button"')
    expect(button).toContain('data-state="visible"')
    expect(button).not.toContain('aria-hidden')
    expect(button).not.toContain('tabindex')
    expect(html).toContain('3 new messages')
  })

  it('uses the singular for one item', () => {
    expect(render({ controller: controller({ newCount: 1 }) })).toContain('1 new message<')
  })

  it('says "Jump to latest" when away with nothing new', () => {
    expect(render({ controller: controller() })).toContain('Jump to latest')
  })

  it('accepts a custom pluralisation and fallback label', () => {
    const formatNewCount = (n: number) => `${n} nouveaux`
    expect(render({ controller: controller({ newCount: 4 }), formatNewCount })).toContain('4 nouveaux')
    expect(render({ controller: controller(), latestLabel: 'Aller en bas' })).toContain('Aller en bas')
  })

  it('hides the pill at the end: out of the tab order and the accessibility tree', () => {
    const { button } = parse(render({ controller: controller({ atEnd: true }) }))
    expect(button).toContain('data-state="hidden"')
    expect(button).toContain('aria-hidden="true"')
    expect(button).toContain('tabindex="-1"')
    expect(button).toContain('pointer-events-none')
  })

  it('cannot be put back in the tab order by a consumer while hidden', () => {
    const { button } = parse(render({ controller: controller({ atEnd: true }), tabIndex: 0 }))
    expect(button).toContain('tabindex="-1"')
  })

  it('renders an empty polite status region that stays mounted while hidden', () => {
    for (const atEnd of [true, false]) {
      const html = render({ controller: controller({ atEnd, newCount: atEnd ? 0 : 2 }) })
      const { region } = parse(html)
      expect(region).toContain('aria-live="polite"')
      expect(region).toContain('aria-atomic="true"')
      expect(region).toContain('sr-only')
      // Nothing is announced on the server/at mount.
      expect(html).toMatch(/role="status"[^>]*><\/span>/)
    }
  })

  it('marks the decorative arrow as hidden', () => {
    expect(render({ controller: controller() })).toMatch(/<svg[^>]*aria-hidden="true"/)
  })

  it('applies the focus ring, 44px target, reduced-motion classes and className', () => {
    const { button } = parse(render({ controller: controller(), className: 'absolute bottom-4' }))
    expect(button).toContain('focus-visible:ring-2')
    expect(button).toContain('focus-visible:ring-ring')
    expect(button).toContain('min-h-11')
    expect(button).toContain('motion-reduce:transition-none')
    expect(button).toContain('absolute bottom-4')
  })

  it('exposes which target it jumps to', () => {
    expect(parse(render({ controller: controller() })).button).toContain('data-jump-to="latest"')
    expect(parse(render({ controller: controller(), jumpTo: 'first-unread' })).button).toContain(
      'data-jump-to="first-unread"',
    )
  })

  it('passes through DOM attributes', () => {
    const { button } = parse(render({ controller: controller(), id: 'jtl', 'aria-describedby': 'hint' }))
    expect(button).toContain('id="jtl"')
    expect(button).toContain('aria-describedby="hint"')
  })
})

describe('useJumpToLatest (SSR)', () => {
  function Harness() {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const jtl = useJumpToLatest({ scrollRef, keys: ['a', 'b'] })
    return (
      <div>
        <div ref={scrollRef} />
        <JumpToLatest controller={jtl} />
      </div>
    )
  }

  it('starts at the end, so the server renders the pill hidden', () => {
    const { button } = parse(renderToString(<Harness />))
    expect(button).toContain('data-state="hidden"')
    expect(button).toContain('aria-hidden="true"')
  })
})
