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
