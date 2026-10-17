import { describe, it, expect } from 'vitest'
import {
  createLiveDot,
  resolveLiveDotSize,
  resolveLiveDotColor,
  isLiveDotColor,
  isLiveDotSizeName,
  LIVE_DOT_COLORS,
  LIVE_DOT_SIZES,
  LIVE_DOT_DEFAULT_COLOR,
  LIVE_DOT_DEFAULT_SIZE,
  liveDotVariants,
  liveDotCoreVariants,
  liveDotHaloVariants,
  liveDotColorClasses,
} from '../src/index.js'

describe('createLiveDot', () => {
  it('defaults to a live, decorative, success-coloured sm dot', () => {
    const api = createLiveDot()
    expect(api.live).toBe(true)
    expect(api.color).toBe('success')
    expect(api.size).toEqual({ variant: 'sm' })
    expect(api.label).toBeUndefined()
    expect(api.ariaProps).toEqual({ 'aria-hidden': 'true' })
    expect(api.style).toEqual({})
  })

  it('reports liveness through data-live', () => {
    expect(createLiveDot({ live: true }).dataAttributes['data-live']).toBe('true')
    expect(createLiveDot({ live: false }).dataAttributes['data-live']).toBe('false')
    expect(createLiveDot({ live: false }).live).toBe(false)
  })

  it('exposes colour and size as data attributes', () => {
    const api = createLiveDot({ color: 'destructive', size: 'lg' })
    expect(api.dataAttributes).toEqual({
      'data-live': 'true',
      'data-color': 'destructive',
      'data-size': 'lg',
    })
  })

  it('becomes a labelled image when given a label', () => {
    const api = createLiveDot({ label: 'Recording' })
    expect(api.label).toBe('Recording')
    expect(api.ariaProps).toEqual({ role: 'img', 'aria-label': 'Recording' })
    expect(api.ariaProps).not.toHaveProperty('aria-hidden')
  })

  it('trims the label and treats a blank label as decorative', () => {
    expect(createLiveDot({ label: '  Live  ' }).label).toBe('Live')
    const blank = createLiveDot({ label: '   ' })
    expect(blank.label).toBeUndefined()
    expect(blank.ariaProps).toEqual({ 'aria-hidden': 'true' })
  })

  it('returns an inline rem width/height for a numeric size', () => {
    const api = createLiveDot({ size: 0.875 })
    expect(api.size).toEqual({ variant: 'custom', dimension: '0.875rem' })
    expect(api.style).toEqual({ width: '0.875rem', height: '0.875rem' })
    expect(api.dataAttributes['data-size']).toBe('custom')
  })

  it('is deterministic for the same input', () => {
    const props = { live: true, color: 'info', size: 'md', label: 'On air' } as const
    expect(createLiveDot(props)).toEqual(createLiveDot(props))
  })
})

describe('resolveLiveDotSize', () => {
  it.each(LIVE_DOT_SIZES)('keeps the named size %s', (size) => {
    expect(resolveLiveDotSize(size)).toEqual({ variant: size })
  })

  it('falls back to the default when undefined', () => {
    expect(resolveLiveDotSize(undefined)).toEqual({ variant: LIVE_DOT_DEFAULT_SIZE })
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects the non-positive or non-finite number %s',
    (size) => {
      expect(resolveLiveDotSize(size)).toEqual({ variant: LIVE_DOT_DEFAULT_SIZE })
    },
  )

  it('falls back for an unknown name passed at runtime', () => {
    // Simulates an untyped caller (e.g. data from a CMS).
    expect(resolveLiveDotSize('huge' as never)).toEqual({ variant: LIVE_DOT_DEFAULT_SIZE })
  })
})

describe('resolveLiveDotColor', () => {
  it.each(LIVE_DOT_COLORS)('keeps the token %s', (color) => {
    expect(resolveLiveDotColor(color)).toBe(color)
  })

  it('falls back for undefined and for raw CSS colours', () => {
    expect(resolveLiveDotColor(undefined)).toBe(LIVE_DOT_DEFAULT_COLOR)
    expect(resolveLiveDotColor('#ff0000')).toBe(LIVE_DOT_DEFAULT_COLOR)
    expect(resolveLiveDotColor('red')).toBe(LIVE_DOT_DEFAULT_COLOR)
  })
})

describe('type guards', () => {
  it('isLiveDotColor accepts only token names', () => {
    expect(isLiveDotColor('warning')).toBe(true)
    expect(isLiveDotColor('rgb(0,0,0)')).toBe(false)
    expect(isLiveDotColor(3)).toBe(false)
  })

  it('isLiveDotSizeName accepts only named sizes', () => {
    expect(isLiveDotSizeName('xs')).toBe(true)
    expect(isLiveDotSizeName('custom')).toBe(false)
    expect(isLiveDotSizeName(1)).toBe(false)
  })
})

describe('styles', () => {
  it('maps every colour to a semantic bg token class', () => {
    for (const color of LIVE_DOT_COLORS) {
      expect(liveDotColorClasses[color]).toMatch(/^bg-[a-z-]+$/)
      expect(liveDotCoreVariants({ color })).toContain(liveDotColorClasses[color])
      expect(liveDotHaloVariants({ color })).toContain(liveDotColorClasses[color])
    }
  })

  it('never uses raw colour literals', () => {
    const all = [
      ...LIVE_DOT_COLORS.map((color) => liveDotHaloVariants({ color })),
      ...LIVE_DOT_COLORS.map((color) => liveDotCoreVariants({ color })),
    ].join(' ')
    expect(all).not.toMatch(/#[0-9a-f]{3,8}|rgb|hsl/i)
  })

  it('animates the halo and holds it still under reduced motion', () => {
    const halo = liveDotHaloVariants()
    expect(halo).toContain('animate-ping')
    expect(halo).toContain('motion-reduce:animate-none')
  })

  it('applies a size class per named size and none for custom', () => {
    expect(liveDotVariants({ size: 'xs' })).toContain('size-1.5')
    expect(liveDotVariants({ size: 'lg' })).toContain('size-3')
    expect(liveDotVariants({ size: 'custom' })).not.toMatch(/\bsize-/)
    expect(liveDotVariants()).toContain('size-2')
  })
})
