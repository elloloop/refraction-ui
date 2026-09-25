import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { ActionList, ActionListItem } from '../src/action-list.js'

const h = React.createElement

describe('ActionList (SSR)', () => {
  it('renders a list of native button rows', () => {
    const html = renderToString(
      h(ActionList, { 'aria-label': 'Reports' },
        h(ActionListItem, { title: 'Quarterly report' }),
        h(ActionListItem, { title: 'Annual summary' }),
      ),
    )
    expect(html).toMatch(/^<ul/)
    expect(html).toContain('aria-label="Reports"')
    expect((html.match(/<li><button type="button"/g) ?? []).length).toBe(2)
  })

  it('renders description, meta and trailing only when given', () => {
    const bare = renderToString(h(ActionListItem, { title: 'Report' }))
    expect(bare).not.toContain('tabular-nums')
    const html = renderToString(
      h(ActionListItem, {
        title: 'Report',
        description: 'Revenue by region',
        meta: 'Finance',
        trailing: 'Updated 2h ago',
      }),
    )
    expect(html).toContain('Revenue by region')
    expect(html).toContain('Finance')
    expect(html).toContain('Updated 2h ago')
    expect(html).toContain('tabular-nums')
  })

  it('disables the button and marks it', () => {
    const html = renderToString(h(ActionListItem, { title: 'Report', disabled: true }))
    expect(html).toContain('disabled=""')
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('data-disabled=""')
  })

  it('applies compact density', () => {
    const html = renderToString(h(ActionListItem, { title: 'Report', density: 'compact' }))
    expect(html).toContain('data-density="compact"')
    expect(html).toContain('py-2')
  })
})
