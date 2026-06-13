import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Checklist } from '../src/checklist.js'
import type { ChecklistItemData } from '../src/checklist.js'

const ITEMS: ChecklistItemData[] = [
  { id: '1', label: 'Write tests', checked: false },
  { id: '2', label: 'Review PR', checked: true },
  { id: '3', label: 'Deploy', checked: false },
]

const render = (props: React.ComponentProps<typeof Checklist>) =>
  renderToString(React.createElement(Checklist, props))

describe('Checklist (SSR)', () => {
  it('renders a role="list" container', () => {
    const html = render({ items: ITEMS })
    expect(html).toContain('role="list"')
  })

  it('renders one role="checkbox" per item', () => {
    const html = render({ items: ITEMS })
    expect((html.match(/role="checkbox"/g) ?? []).length).toBe(3)
  })

  it('marks checked items with aria-checked="true"', () => {
    const html = render({ items: ITEMS })
    expect((html.match(/aria-checked="true"/g) ?? []).length).toBe(1)
  })

  it('marks unchecked items with aria-checked="false"', () => {
    const html = render({ items: ITEMS })
    expect((html.match(/aria-checked="false"/g) ?? []).length).toBe(2)
  })

  it('renders item labels', () => {
    const html = render({ items: ITEMS })
    expect(html).toContain('Write tests')
    expect(html).toContain('Review PR')
    expect(html).toContain('Deploy')
  })

  it('renders descriptions when provided', () => {
    const itemsWithDesc: ChecklistItemData[] = [
      { id: '1', label: 'Alpha', description: 'Extra detail', checked: false },
    ]
    const html = render({ items: itemsWithDesc })
    expect(html).toContain('Extra detail')
  })

  it('renders progress summary when showProgress is true', () => {
    const html = render({ items: ITEMS, showProgress: true })
    expect(html).toContain('1/3 completed')
  })

  it('does not render progress summary by default', () => {
    const html = render({ items: ITEMS })
    expect(html).not.toContain('completed')
  })

  it('renders data-component attribute on the container', () => {
    const html = render({ items: ITEMS })
    expect(html).toContain('data-component="checklist"')
  })
})
