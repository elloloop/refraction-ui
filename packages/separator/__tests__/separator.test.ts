import { describe, it, expect } from 'vitest'
import { createSeparator } from '../src/separator.js'
import { separatorVariants } from '../src/separator.styles.js'

describe('createSeparator', () => {
  it('decorative (default) exposes role="none" and no aria-orientation', () => {
    const { ariaProps } = createSeparator()
    expect(ariaProps.role).toBe('none')
    expect(ariaProps['aria-orientation']).toBeUndefined()
  })

  it('non-decorative exposes role="separator" with aria-orientation', () => {
    const { ariaProps } = createSeparator({ decorative: false })
    expect(ariaProps.role).toBe('separator')
    expect(ariaProps['aria-orientation']).toBe('horizontal')
  })

  it('non-decorative vertical reports aria-orientation="vertical"', () => {
    const { ariaProps } = createSeparator({
      orientation: 'vertical',
      decorative: false,
    })
    expect(ariaProps['aria-orientation']).toBe('vertical')
  })

  it('sets a data-orientation attribute', () => {
    expect(createSeparator({ orientation: 'vertical' }).dataAttributes).toEqual({
      'data-orientation': 'vertical',
    })
  })
})

describe('separatorVariants', () => {
  it('horizontal produces a full-width h-px rule', () => {
    expect(separatorVariants({ orientation: 'horizontal' })).toContain('h-px')
  })

  it('vertical produces a full-height w-px rule', () => {
    expect(separatorVariants({ orientation: 'vertical' })).toContain('w-px')
  })

  it('labeled produces a flex layout', () => {
    expect(separatorVariants({ labeled: 'true' })).toContain('flex items-center')
  })
})
