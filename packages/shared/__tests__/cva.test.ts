import { describe, it, expect } from 'vitest'
import { cva } from '../src/cva.js'

describe('cva', () => {
  const button = cva({
    base: 'btn',
    variants: {
      variant: {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
      },
      size: {
        sm: 'btn-sm',
        lg: 'btn-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
    },
  })

  it('applies base class', () => {
    expect(button()).toContain('btn')
  })

  it('applies default variants', () => {
    const result = button()
    expect(result).toContain('btn-primary')
    expect(result).toContain('btn-sm')
  })

  it('overrides with provided variants', () => {
    const result = button({ variant: 'secondary', size: 'lg' })
    expect(result).toContain('btn-secondary')
    expect(result).toContain('btn-lg')
    expect(result).not.toContain('btn-primary')
  })

  it('appends className', () => {
    const result = button({ className: 'extra' })
    expect(result).toContain('extra')
  })

  it('handles compound variants', () => {
    const pill = cva({
      base: 'pill',
      variants: {
        color: { red: 'pill-red', blue: 'pill-blue' },
        size: { sm: 'pill-sm', lg: 'pill-lg' },
      },
      compoundVariants: [
        { color: 'red', size: 'lg', class: 'pill-red-lg' },
      ],
      defaultVariants: { color: 'red', size: 'sm' },
    })

    expect(pill({ color: 'red', size: 'lg' })).toContain('pill-red-lg')
    expect(pill({ color: 'blue', size: 'lg' })).not.toContain('pill-red-lg')
  })

  it('works with no base class', () => {
    const noBase = cva({
      variants: {
        size: { sm: 'text-sm', lg: 'text-lg' },
      },
      defaultVariants: { size: 'sm' },
    })
    const result = noBase()
    expect(result).toBe('text-sm')
    expect(result).not.toContain('undefined')
  })

  it('works with no variants', () => {
    const noVariants = cva({
      base: 'just-base',
    })
    expect(noVariants()).toBe('just-base')
  })

  it('works with empty variants object', () => {
    const emptyVariants = cva({
      base: 'base-class',
      variants: {},
    })
    expect(emptyVariants()).toBe('base-class')
  })

  it('compound variant with multiple conditions', () => {
    const multi = cva({
      base: 'btn',
      variants: {
        color: { red: 'btn-red', blue: 'btn-blue' },
        size: { sm: 'btn-sm', lg: 'btn-lg' },
        rounded: { yes: 'rounded', no: 'square' },
      },
      compoundVariants: [
        { color: 'red', size: 'lg', rounded: 'yes', class: 'special-pill' },
      ],
      defaultVariants: { color: 'red', size: 'sm', rounded: 'no' },
    })
    expect(multi({ color: 'red', size: 'lg', rounded: 'yes' })).toContain('special-pill')
  })

  it('compound variant does not match partial conditions', () => {
    const multi = cva({
      base: 'btn',
      variants: {
        color: { red: 'btn-red', blue: 'btn-blue' },
        size: { sm: 'btn-sm', lg: 'btn-lg' },
        rounded: { yes: 'rounded', no: 'square' },
      },
      compoundVariants: [
        { color: 'red', size: 'lg', rounded: 'yes', class: 'special-pill' },
      ],
      defaultVariants: { color: 'red', size: 'sm', rounded: 'no' },
    })
    // Only match color and size, not rounded - should not include compound class
    expect(multi({ color: 'red', size: 'lg' })).not.toContain('special-pill')
  })
})
