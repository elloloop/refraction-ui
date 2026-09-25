import { describe, it, expect } from 'vitest'
import { nativeSelectVariants } from '../src/index.js'

const tokens = (s: string) => s.split(/\s+/)

describe('nativeSelectVariants', () => {
  it('defaults to the default size', () => {
    expect(tokens(nativeSelectVariants())).toEqual(expect.arrayContaining(['h-9', 'text-sm', 'appearance-none']))
  })

  it('size variants are not contradicted by the base', () => {
    const sm = tokens(nativeSelectVariants({ size: 'sm' }))
    expect(sm).toEqual(expect.arrayContaining(['h-8', 'text-xs']))
    expect(sm).not.toContain('h-9')
    expect(sm).not.toContain('text-sm')
  })
})
