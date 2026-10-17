import { describe, it, expect } from 'vitest'
import {
  createField,
  fieldHintId,
  mergeDescribedBy,
  fieldVariants,
  fieldLabelVariants,
  fieldHintVariants,
} from '../src/index.js'

describe('createField', () => {
  it('defaults to a stacked layout with a regular label', () => {
    const api = createField()
    expect(api.dataAttributes).toEqual({ 'data-slot': 'field', 'data-layout': 'stacked' })
    expect(api.rootClass).toContain('flex-col')
    expect(api.labelClass).toBe('text-sm font-medium leading-none text-foreground')
    expect(api.hintClass).toBe('text-xs text-muted-foreground')
  })

  it('grows only when asked', () => {
    expect(createField().rootClass).not.toContain('flex-1')
    expect(createField({ grow: false }).rootClass).not.toContain('flex-1')
    expect(createField({ grow: true }).rootClass).toContain('flex-1 basis-56')
  })

  it('lays an inline field out as control, then label, with the hint under the label', () => {
    const api = createField({ layout: 'inline' })
    expect(api.dataAttributes['data-layout']).toBe('inline')
    expect(api.rootClass).toContain('inline-grid')
    expect(api.rootClass).toContain('items-center')
    expect(api.labelClass).toBe('text-sm text-foreground')
    expect(api.hintClass).toContain('col-start-2')
  })

  it('renders an eyebrow label in either layout', () => {
    const eyebrow = 'text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground'
    expect(createField({ labelTone: 'eyebrow' }).labelClass).toBe(eyebrow)
    expect(createField({ layout: 'inline', labelTone: 'eyebrow' }).labelClass).toBe(eyebrow)
  })

  it('agrees with the exported variants', () => {
    const api = createField({ layout: 'inline', grow: true, labelTone: 'eyebrow' })
    expect(api.rootClass).toBe(fieldVariants({ layout: 'inline', grow: 'true' }))
    expect(api.labelClass).toBe(fieldLabelVariants({ layout: 'inline', tone: 'eyebrow' }))
    expect(api.hintClass).toBe(fieldHintVariants({ layout: 'inline' }))
  })
})

describe('fieldHintId', () => {
  it('derives the hint id from the control id', () => {
    expect(fieldHintId('email')).toBe('email-hint')
  })
})

describe('mergeDescribedBy', () => {
  it('joins id lists and drops empty values', () => {
    expect(mergeDescribedBy('a', undefined, false, null, '', 'b')).toBe('a b')
  })

  it('splits whitespace-separated lists and removes duplicates', () => {
    expect(mergeDescribedBy('a  b', 'b c', 'a')).toBe('a b c')
  })

  it('returns undefined when nothing is left, so the attribute is omitted', () => {
    expect(mergeDescribedBy()).toBeUndefined()
    expect(mergeDescribedBy(undefined, false, '  ')).toBeUndefined()
  })
})
