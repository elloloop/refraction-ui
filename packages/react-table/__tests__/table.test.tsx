import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from '../src/table.js'

const h = React.createElement

function sample(props: React.ComponentProps<typeof Table> = {}) {
  return renderToString(
    h(Table, props,
      h(TableCaption, null, 'Orders'),
      h(TableHeader, null, h(TableRow, null, h(TableHead, null, 'Customer'), h(TableHead, { align: 'end' }, 'Total'))),
      h(TableBody, null, h(TableRow, null,
        h(TableCell, null, h('a', { href: '/c/1' }, 'Ada')),
        h(TableCell, { align: 'end', numeric: true }, '$1,200'),
      )),
    ),
  )
}

describe('Table (SSR)', () => {
  it('renders native table semantics inside a scroll container', () => {
    const html = sample()
    expect(html).toContain('data-slot="table-container"')
    expect(html).toMatch(/<table[^>]*data-slot="table"/)
    expect(html).toContain('<caption')
    expect((html.match(/scope="col"/g) ?? []).length).toBe(2)
  })

  it('renders component cells and alignment', () => {
    const html = sample()
    expect(html).toContain('<a href="/c/1">Ada</a>')
    expect(html).toContain('text-end')
    expect(html).toContain('tabular-nums')
  })

  it('applies density and head tone from the root to every cell', () => {
    const html = sample({ density: 'compact', headTone: 'eyebrow', fixed: true, containerClassName: 'max-h-64' })
    expect(html).toContain('py-1.5')
    expect(html).toContain('h-8 px-2')
    expect(html).toContain('uppercase')
    expect(html).toContain('table-fixed')
    expect(html).toContain('max-h-64')
  })
})
