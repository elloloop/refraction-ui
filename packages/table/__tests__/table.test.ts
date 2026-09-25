import { describe, it, expect } from 'vitest'
import { createTable, tableRootVariants, tableHeadVariants, tableCellVariants } from '../src/index.js'

const tokens = (s: string) => s.split(/\s+/)

describe('table core', () => {
  it('exposes density and head tone as data attributes', () => {
    expect(createTable().dataAttributes).toEqual({
      'data-slot': 'table',
      'data-density': 'default',
      'data-head-tone': 'default',
    })
    expect(createTable({ density: 'compact', headTone: 'eyebrow' }).dataAttributes['data-density']).toBe('compact')
  })

  it('fixed layout is opt-in', () => {
    expect(tokens(tableRootVariants())).not.toContain('table-fixed')
    expect(tokens(tableRootVariants({ fixed: 'true' }))).toContain('table-fixed')
  })

  it('aligns with logical text classes and pads by density', () => {
    expect(tokens(tableCellVariants({ align: 'end' }))).toContain('text-end')
    expect(tokens(tableCellVariants({ density: 'compact' }))).toContain('py-1.5')
    expect(tokens(tableCellVariants({ numeric: 'true' }))).toContain('tabular-nums')
    expect(tokens(tableHeadVariants({ tone: 'eyebrow' }))).toContain('uppercase')
  })
})
