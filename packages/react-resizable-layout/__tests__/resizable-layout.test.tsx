import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  ResizableLayout,
  ResizablePane,
  ResizableDivider,
} from '../src/resizable-layout.js'

describe('ResizableLayout (React)', () => {
  it('renders a div with flex layout classes', () => {
    const html = renderToString(
      React.createElement(ResizableLayout, null, 'content'),
    )
    expect(html).toContain('flex')
    expect(html).toContain('content')
  })

  it('applies horizontal orientation by default', () => {
    const html = renderToString(
      React.createElement(ResizableLayout, null, 'content'),
    )
    expect(html).toContain('flex-row')
    expect(html).toContain('data-orientation="horizontal"')
  })

  it('applies vertical orientation', () => {
    const html = renderToString(
      React.createElement(
        ResizableLayout,
        { orientation: 'vertical' },
        'content',
      ),
    )
    expect(html).toContain('flex-col')
    expect(html).toContain('data-orientation="vertical"')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(
        ResizableLayout,
        { className: 'my-layout' },
        'content',
      ),
    )
    expect(html).toContain('my-layout')
  })

  it('sets CSS custom properties for pane sizes', () => {
    const html = renderToString(
      React.createElement(
        ResizableLayout,
        { defaultSizes: [30, 70] },
        'content',
      ),
    )
    expect(html).toContain('--rfr-pane-0-size:30%')
    expect(html).toContain('--rfr-pane-1-size:70%')
  })
})

describe('ResizablePane (React)', () => {
  it('renders a pane with flex-basis from size', () => {
    const html = renderToString(
      React.createElement(
        ResizableLayout,
        { defaultSizes: [40, 60] },
        React.createElement(ResizablePane, { index: 0 }, 'Left'),
        React.createElement(ResizablePane, { index: 1 }, 'Right'),
      ),
    )
    expect(html).toContain('Left')
    expect(html).toContain('Right')
    expect(html).toContain('flex-basis:40%')
    expect(html).toContain('flex-basis:60%')
  })

  it('sets data-pane-index', () => {
    const html = renderToString(
      React.createElement(
        ResizableLayout,
        null,
        React.createElement(ResizablePane, { index: 0 }, 'Pane'),
      ),
    )
    expect(html).toContain('data-pane-index="0"')
  })
})

describe('ResizableDivider (React)', () => {
  it('renders a divider with role=separator', () => {
    const html = renderToString(
      React.createElement(
        ResizableLayout,
        null,
        React.createElement(ResizablePane, { index: 0 }, 'Left'),
        React.createElement(ResizableDivider, { index: 0 }),
        React.createElement(ResizablePane, { index: 1 }, 'Right'),
      ),
    )
    expect(html).toContain('role="separator"')
    expect(html).toContain('data-divider-index="0"')
  })

  it('has col-resize cursor for horizontal orientation', () => {
    const html = renderToString(
      React.createElement(
        ResizableLayout,
        { orientation: 'horizontal' },
        React.createElement(ResizableDivider, { index: 0 }),
      ),
    )
    expect(html).toContain('cursor-col-resize')
  })

  it('has row-resize cursor for vertical orientation', () => {
    const html = renderToString(
      React.createElement(
        ResizableLayout,
        { orientation: 'vertical' },
        React.createElement(ResizableDivider, { index: 0 }),
      ),
    )
    expect(html).toContain('cursor-row-resize')
  })

  it('is keyboard focusable', () => {
    const html = renderToString(
      React.createElement(
        ResizableLayout,
        null,
        React.createElement(ResizableDivider, { index: 0 }),
      ),
    )
    expect(html).toContain('tabindex="0"')
  })
})
