import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Select, SelectTrigger, SelectContent, SelectItem } from '../src/select.js'

describe('Select (React)', () => {
  it('renders children', () => {
    const html = renderToString(
      React.createElement(Select, null, React.createElement('span', null, 'child')),
    )
    expect(html).toContain('child')
  })
})

describe('SelectTrigger (React)', () => {
  it('renders a button element', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger, null, 'Pick one'),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
    expect(html).toContain('Pick one')
  })

  it('has role combobox', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger),
      ),
    )
    expect(html).toContain('role="combobox"')
  })

  it('aria-expanded is false when closed', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger),
      ),
    )
    expect(html).toContain('aria-expanded="false"')
  })

  it('data-state is closed initially', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger),
      ),
    )
    expect(html).toContain('data-state="closed"')
  })

  it('disabled sets disabled attribute', () => {
    const html = renderToString(
      React.createElement(
        Select,
        { disabled: true },
        React.createElement(SelectTrigger),
      ),
    )
    expect(html).toContain('disabled')
    expect(html).toContain('aria-disabled="true"')
  })

  it('renders chevron SVG icon', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger),
      ),
    )
    expect(html).toContain('<svg')
    expect(html).toContain('m6 9 6 6 6-6')
  })

  it('applies default size h-9', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger, { size: 'default' }),
      ),
    )
    expect(html).toContain('h-9')
  })

  it('applies sm size h-8', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger, { size: 'sm' }),
      ),
    )
    expect(html).toContain('h-8')
  })

  it('applies lg size h-10', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger, { size: 'lg' }),
      ),
    )
    expect(html).toContain('h-10')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger, { className: 'my-trigger' }),
      ),
    )
    expect(html).toContain('my-trigger')
  })

  it('base classes include rounded-md and border', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger),
      ),
    )
    expect(html).toContain('rounded-md')
    expect(html).toContain('border')
  })
})

describe('SelectContent (React)', () => {
  it('does not render when closed', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(SelectContent, null, 'Hidden'),
      ),
    )
    expect(html).not.toContain('Hidden')
  })
})

describe('SelectItem (React)', () => {
  it('renders item text inside Select', () => {
    // SelectItem renders inside Select context even when content is closed
    // but SelectContent hides it; we test it standalone
    const html = renderToString(
      React.createElement(
        Select,
        { value: 'apple' },
        React.createElement(
          'div',
          null,
          React.createElement(SelectItem, { value: 'apple' }, 'Apple'),
        ),
      ),
    )
    expect(html).toContain('Apple')
    expect(html).toContain('role="option"')
  })

  it('marks selected item with aria-selected true', () => {
    const html = renderToString(
      React.createElement(
        Select,
        { value: 'apple' },
        React.createElement(
          'div',
          null,
          React.createElement(SelectItem, { value: 'apple' }, 'Apple'),
        ),
      ),
    )
    expect(html).toContain('aria-selected="true"')
  })

  it('marks unselected item with aria-selected false', () => {
    const html = renderToString(
      React.createElement(
        Select,
        { value: 'apple' },
        React.createElement(
          'div',
          null,
          React.createElement(SelectItem, { value: 'banana' }, 'Banana'),
        ),
      ),
    )
    expect(html).toContain('aria-selected="false"')
  })

  it('renders checkmark for selected item', () => {
    const html = renderToString(
      React.createElement(
        Select,
        { value: 'apple' },
        React.createElement(
          'div',
          null,
          React.createElement(SelectItem, { value: 'apple' }, 'Apple'),
        ),
      ),
    )
    expect(html).toContain('M20 6L9 17l-5-5')
  })

  it('does not render checkmark for unselected item', () => {
    const html = renderToString(
      React.createElement(
        Select,
        { value: 'apple' },
        React.createElement(
          'div',
          null,
          React.createElement(SelectItem, { value: 'banana' }, 'Banana'),
        ),
      ),
    )
    expect(html).not.toContain('M20 6L9 17l-5-5')
  })

  it('disabled item has aria-disabled', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(
          'div',
          null,
          React.createElement(SelectItem, { value: 'cherry', disabled: true }, 'Cherry'),
        ),
      ),
    )
    expect(html).toContain('aria-disabled="true"')
  })

  it('applies custom className to item', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(
          'div',
          null,
          React.createElement(SelectItem, { value: 'x', className: 'my-item' }, 'X'),
        ),
      ),
    )
    expect(html).toContain('my-item')
  })

  it('base item classes include cursor-default', () => {
    const html = renderToString(
      React.createElement(
        Select,
        null,
        React.createElement(
          'div',
          null,
          React.createElement(SelectItem, { value: 'x' }, 'X'),
        ),
      ),
    )
    expect(html).toContain('cursor-default')
    expect(html).toContain('select-none')
  })
})
