import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '../src/segmented-control.js'

function render(
  props: Record<string, unknown>,
  items: Array<{ value: string; children: React.ReactNode }>,
) {
  return renderToString(
    React.createElement(
      SegmentedControl,
      props,
      ...items.map((item) =>
        React.createElement(
          SegmentedControlItem,
          { key: item.value, value: item.value },
          item.children,
        ),
      ),
    ),
  )
}

const basicItems = [
  { value: 'day', children: 'Day' },
  { value: 'week', children: 'Week' },
  { value: 'month', children: 'Month' },
]

describe('SegmentedControl (React)', () => {
  it('renders a radiogroup role', () => {
    const html = render({ defaultValue: 'day' }, basicItems)
    expect(html).toContain('role="radiogroup"')
  })

  it('renders items with radio role', () => {
    const html = render({ defaultValue: 'day' }, basicItems)
    expect(html.match(/role="radio"/g)).toHaveLength(3)
  })

  it('reflects the selected value via aria-checked', () => {
    const html = render({ value: 'week' }, basicItems)
    // The selected item carries aria-checked="true".
    expect(html).toContain('aria-checked="true"')
    expect(html).toContain('Week')
  })

  it('marks the selected item with data-state="checked"', () => {
    const html = render({ value: 'month' }, basicItems)
    expect(html).toContain('data-state="checked"')
    expect(html).toContain('data-state="unchecked"')
  })

  it('makes only the selected item tabbable (roving tabindex)', () => {
    const html = render({ value: 'day' }, basicItems)
    expect(html.match(/tabindex="0"/g)).toHaveLength(1)
    expect(html.match(/tabindex="-1"/g)).toHaveLength(2)
  })

  it('applies md size classes by default', () => {
    const html = render({ defaultValue: 'day' }, basicItems)
    expect(html).toContain('px-3')
    expect(html).toContain('text-sm')
  })

  it('applies sm size classes', () => {
    const html = render({ defaultValue: 'day', size: 'sm' }, basicItems)
    expect(html).toContain('px-2.5')
    expect(html).toContain('text-xs')
  })

  it('applies the active item visual classes', () => {
    const html = render({ value: 'day' }, basicItems)
    expect(html).toContain('bg-background')
    expect(html).toContain('shadow-sm')
    expect(html).toContain('text-muted-foreground')
  })

  it('appends a custom className on the group', () => {
    const html = render(
      { defaultValue: 'day', className: 'my-control' },
      basicItems,
    )
    expect(html).toContain('my-control')
    expect(html).toContain('bg-muted')
  })

  it('passes through aria-label on the group', () => {
    const html = render(
      { defaultValue: 'day', 'aria-label': 'View mode' },
      basicItems,
    )
    expect(html).toContain('aria-label="View mode"')
  })

  it('renders a leading icon alongside item text', () => {
    const html = renderToString(
      React.createElement(
        SegmentedControl,
        { defaultValue: 'list' },
        React.createElement(
          SegmentedControlItem,
          { value: 'list' },
          React.createElement('svg', { 'data-testid': 'icon' }),
          'List',
        ),
      ),
    )
    expect(html).toContain('<svg')
    expect(html).toContain('List')
  })
})

describe('SegmentedControl (React) - additional SSR coverage', () => {
  it('group carries data-size and data-value', () => {
    const html = render({ defaultValue: 'week' }, basicItems)
    expect(html).toContain('data-size="md"')
    expect(html).toContain('data-value="week"')
  })

  it('group data-size reflects the size prop', () => {
    const html = render({ defaultValue: 'day', size: 'sm' }, basicItems)
    expect(html).toContain('data-size="sm"')
  })

  it('omits data-value when nothing is selected', () => {
    const html = render({}, basicItems)
    expect(html).not.toContain('data-value')
  })

  it('uncontrolled defaultValue selects the matching item', () => {
    const html = render({ defaultValue: 'month' }, basicItems)
    const monthButton = html.match(/<button[^>]*>Month<\/button>/)
    expect(monthButton).toBeTruthy()
    expect(monthButton![0]).toContain('aria-checked="true"')
    expect(monthButton![0]).toContain('tabindex="0"')
  })

  it('no selection renders every item unchecked and untabbable', () => {
    const html = render({}, basicItems)
    expect(html).not.toContain('aria-checked="true"')
    expect(html.match(/tabindex="-1"/g)).toHaveLength(3)
  })

  it('items render type="button"', () => {
    const html = render({ defaultValue: 'day' }, basicItems)
    expect(html.match(/type="button"/g)).toHaveLength(3)
  })

  it('applies a custom className to an item', () => {
    const html = renderToString(
      React.createElement(
        SegmentedControl,
        { defaultValue: 'day' },
        React.createElement(
          SegmentedControlItem,
          { value: 'day', className: 'my-item' },
          'Day',
        ),
      ),
    )
    expect(html).toContain('my-item')
  })

  it('passes the disabled attribute through to an item', () => {
    const html = renderToString(
      React.createElement(
        SegmentedControl,
        { defaultValue: 'day' },
        React.createElement(SegmentedControlItem, { value: 'day' }, 'Day'),
        React.createElement(SegmentedControlItem, { value: 'week', disabled: true }, 'Week'),
      ),
    )
    const weekButton = html.match(/<button[^>]*>Week<\/button>/)
    expect(weekButton).toBeTruthy()
    expect(weekButton![0]).toContain('disabled=""')
  })

  it('group base classes include bg-muted and rounded-lg', () => {
    const html = render({ defaultValue: 'day' }, basicItems)
    expect(html).toContain('bg-muted')
    expect(html).toContain('rounded-lg')
  })

  it('unselected items carry hover and muted text classes', () => {
    const html = render({ value: 'day' }, basicItems)
    expect(html).toContain('text-muted-foreground')
    expect(html).toContain('hover:text-foreground')
  })

  it('throws when SegmentedControlItem is used outside SegmentedControl', () => {
    expect(() =>
      renderToString(
        React.createElement(SegmentedControlItem, { value: 'day' }, 'Day'),
      ),
    ).toThrow('must be used within <SegmentedControl>')
  })
})
