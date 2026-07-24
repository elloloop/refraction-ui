import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Skeleton, SkeletonText } from '../src/skeleton.js'

describe('Skeleton (React)', () => {
  it('renders a div element', () => {
    const html = renderToString(React.createElement(Skeleton))
    expect(html).toContain('<div')
  })

  it('applies default text shape classes', () => {
    const html = renderToString(React.createElement(Skeleton))
    expect(html).toContain('animate-pulse')
    expect(html).toContain('bg-muted')
    expect(html).toContain('h-4')
    expect(html).toContain('w-full')
  })

  it('applies circular shape classes', () => {
    const html = renderToString(
      React.createElement(Skeleton, { shape: 'circular' }),
    )
    expect(html).toContain('rounded-full')
  })

  it('applies rectangular shape classes', () => {
    const html = renderToString(
      React.createElement(Skeleton, { shape: 'rectangular' }),
    )
    expect(html).toContain('rounded-none')
  })

  it('applies rounded shape classes', () => {
    const html = renderToString(
      React.createElement(Skeleton, { shape: 'rounded' }),
    )
    expect(html).toContain('rounded-md')
  })

  it('sets aria-hidden true', () => {
    const html = renderToString(React.createElement(Skeleton))
    expect(html).toContain('aria-hidden="true"')
  })

  it('sets role presentation', () => {
    const html = renderToString(React.createElement(Skeleton))
    expect(html).toContain('role="presentation"')
  })

  it('sets data-shape attribute', () => {
    const html = renderToString(
      React.createElement(Skeleton, { shape: 'circular' }),
    )
    expect(html).toContain('data-shape="circular"')
  })

  it('sets data-animate attribute', () => {
    const html = renderToString(
      React.createElement(Skeleton, { animate: false }),
    )
    expect(html).toContain('data-animate="false"')
  })

  it('applies custom width and height via style', () => {
    const html = renderToString(
      React.createElement(Skeleton, { width: 100, height: 50 }),
    )
    expect(html).toContain('width:100px')
    expect(html).toContain('height:50px')
  })

  it('applies string width via style', () => {
    const html = renderToString(
      React.createElement(Skeleton, { width: '80%' }),
    )
    expect(html).toContain('width:80%')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(Skeleton, { className: 'my-skeleton' }),
    )
    expect(html).toContain('my-skeleton')
  })
})

describe('SkeletonText (React)', () => {
  it('renders a container div', () => {
    const html = renderToString(React.createElement(SkeletonText))
    expect(html).toContain('<div')
    expect(html).toContain('space-y-2')
  })

  it('renders 3 lines by default', () => {
    const html = renderToString(React.createElement(SkeletonText))
    const matches = html.match(/data-shape="text"/g)
    expect(matches).toHaveLength(3)
  })

  it('renders the specified number of lines', () => {
    const html = renderToString(
      React.createElement(SkeletonText, { lines: 5 }),
    )
    const matches = html.match(/data-shape="text"/g)
    expect(matches).toHaveLength(5)
  })

  it('renders 1 line when lines is 1', () => {
    const html = renderToString(
      React.createElement(SkeletonText, { lines: 1 }),
    )
    const matches = html.match(/data-shape="text"/g)
    expect(matches).toHaveLength(1)
  })

  it('applies custom className to container', () => {
    const html = renderToString(
      React.createElement(SkeletonText, { className: 'my-text-skeleton' }),
    )
    expect(html).toContain('my-text-skeleton')
  })

  it('each line has animate-pulse class', () => {
    const html = renderToString(
      React.createElement(SkeletonText, { lines: 2 }),
    )
    const matches = html.match(/animate-pulse/g)
    expect(matches).toHaveLength(2)
  })

  it('SkeletonText renders multiple lines (4)', () => {
    const html = renderToString(
      React.createElement(SkeletonText, { lines: 4 }),
    )
    const matches = html.match(/data-shape="text"/g)
    expect(matches).toHaveLength(4)
  })

  it('SkeletonText line widths vary across lines', () => {
    const html = renderToString(
      React.createElement(SkeletonText, { lines: 3 }),
    )
    // First line is 100%, second is 92%, third is 85%
    expect(html).toContain('width:100%')
    expect(html).toContain('width:92%')
    expect(html).toContain('width:85%')
  })
})

describe('Skeleton extended (React)', () => {
  it('custom width and height are applied via style', () => {
    const html = renderToString(
      React.createElement(Skeleton, { width: 200, height: 40 }),
    )
    expect(html).toContain('width:200px')
    expect(html).toContain('height:40px')
  })

  it('custom string width applied via style', () => {
    const html = renderToString(
      React.createElement(Skeleton, { width: '50%', height: '2rem' }),
    )
    expect(html).toContain('width:50%')
    expect(html).toContain('height:2rem')
  })

  it('aria-hidden="true" is present on Skeleton', () => {
    const html = renderToString(React.createElement(Skeleton))
    expect(html).toContain('aria-hidden="true"')
  })

  it('role="presentation" is present on Skeleton', () => {
    const html = renderToString(React.createElement(Skeleton))
    expect(html).toContain('role="presentation"')
  })

  it('circular shape renders rounded-full border-radius class', () => {
    const html = renderToString(
      React.createElement(Skeleton, { shape: 'circular' }),
    )
    expect(html).toContain('rounded-full')
  })

  it('rectangular shape renders rounded-none class', () => {
    const html = renderToString(
      React.createElement(Skeleton, { shape: 'rectangular' }),
    )
    expect(html).toContain('rounded-none')
  })

  it('rounded shape renders rounded-md class', () => {
    const html = renderToString(
      React.createElement(Skeleton, { shape: 'rounded' }),
    )
    expect(html).toContain('rounded-md')
  })

  it('each shape variant renders a different border-radius class', () => {
    const circular = renderToString(React.createElement(Skeleton, { shape: 'circular' }))
    const rectangular = renderToString(React.createElement(Skeleton, { shape: 'rectangular' }))
    const rounded = renderToString(React.createElement(Skeleton, { shape: 'rounded' }))
    const text = renderToString(React.createElement(Skeleton, { shape: 'text' }))
    // Each should contain a distinct rounding class
    expect(circular).toContain('rounded-full')
    expect(rectangular).toContain('rounded-none')
    expect(rounded).toContain('rounded-md')
    expect(text).not.toContain('rounded-full')
    expect(text).not.toContain('rounded-none')
    expect(text).not.toContain('rounded-md')
  })

  it('animate=false disables pulse animation class via data-animate', () => {
    const html = renderToString(
      React.createElement(Skeleton, { animate: false }),
    )
    expect(html).toContain('data-animate="false"')
  })
})

describe('Skeleton variants (React)', () => {
  it.each([
    ['text', 'rounded'],
    ['circular', 'rounded-full'],
    ['rectangular', 'rounded-none'],
    ['rounded', 'rounded-md'],
  ] as const)('shape "%s" renders data-shape and its rounding class', (shape, rounding) => {
    const html = renderToString(React.createElement(Skeleton, { shape }))
    expect(html).toContain(`data-shape="${shape}"`)
    expect(html).toContain(rounding)
  })

  it('defaults to the text shape', () => {
    const html = renderToString(React.createElement(Skeleton))
    expect(html).toContain('data-shape="text"')
  })

  it('every variant carries the base animate-pulse and bg-muted classes', () => {
    for (const shape of ['text', 'circular', 'rectangular', 'rounded'] as const) {
      const html = renderToString(React.createElement(Skeleton, { shape }))
      expect(html).toContain('animate-pulse')
      expect(html).toContain('bg-muted')
    }
  })
})

describe('Skeleton dimensions (React)', () => {
  it('renders no inline style when width and height are omitted', () => {
    const html = renderToString(React.createElement(Skeleton))
    expect(html).not.toContain('style=')
  })

  it('applies width without height', () => {
    const html = renderToString(React.createElement(Skeleton, { width: 120 }))
    expect(html).toContain('width:120px')
    expect(html).not.toContain('height:')
  })

  it('applies height without width', () => {
    const html = renderToString(React.createElement(Skeleton, { height: '1.5rem' }))
    expect(html).toContain('height:1.5rem')
    expect(html).not.toContain('width:')
  })

  it('merges a provided style object with width and height', () => {
    const html = renderToString(
      React.createElement(Skeleton, {
        width: 40,
        style: { opacity: 0.5 },
      }),
    )
    expect(html).toContain('width:40px')
    expect(html).toContain('opacity:0.5')
  })

  it('circular skeletons can be sized into avatars via equal width and height', () => {
    const html = renderToString(
      React.createElement(Skeleton, { shape: 'circular', width: 40, height: 40 }),
    )
    expect(html).toContain('rounded-full')
    expect(html).toContain('width:40px')
    expect(html).toContain('height:40px')
  })
})

describe('Skeleton accessibility (React)', () => {
  it('hides the placeholder from assistive tech', () => {
    const html = renderToString(React.createElement(Skeleton))
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('role="presentation"')
    // Loading state is communicated by surrounding content; the decorative
    // placeholder itself carries no aria-busy.
    expect(html).not.toContain('aria-busy')
  })

  it('data-animate defaults to "true"', () => {
    const html = renderToString(React.createElement(Skeleton))
    expect(html).toContain('data-animate="true"')
  })

  it('forwards extra HTML attributes to the root element', () => {
    const html = renderToString(
      React.createElement(Skeleton, { id: 'loading-block', 'data-testid': 'skel' }),
    )
    expect(html).toContain('id="loading-block"')
    expect(html).toContain('data-testid="skel"')
  })
})

describe('SkeletonText extended (React)', () => {
  it('passes animate=false through to every line', () => {
    const html = renderToString(
      React.createElement(SkeletonText, { lines: 3, animate: false }),
    )
    const matches = html.match(/data-animate="false"/g)
    expect(matches).toHaveLength(3)
  })

  it('line widths repeat the 8-entry cycle beyond 8 lines', () => {
    const html = renderToString(React.createElement(SkeletonText, { lines: 9 }))
    // 100% is the first entry, so it reappears on line 9
    const matches = html.match(/width:100%/g)
    expect(matches).toHaveLength(2)
  })

  it('each line is individually hidden from assistive tech', () => {
    const html = renderToString(React.createElement(SkeletonText, { lines: 4 }))
    const matches = html.match(/aria-hidden="true"/g)
    expect(matches).toHaveLength(4)
  })
})
