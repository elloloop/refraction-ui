import { describe, it, expect } from 'vitest'
import { createButton, getButtonType } from '../src/button.js'
import { buttonVariants } from '../src/button.styles.js'

describe('createButton', () => {
  it('returns interactive state by default', () => {
    const api = createButton()
    expect(api.isInteractive).toBe(true)
  })

  it('sets aria-disabled when disabled', () => {
    const api = createButton({ disabled: true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.isInteractive).toBe(false)
  })

  it('sets aria-disabled and data-loading when loading', () => {
    const api = createButton({ loading: true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.dataAttributes['data-loading']).toBe('')
    expect(api.isInteractive).toBe(false)
  })

  it('prevents keyboard interaction when disabled', () => {
    const api = createButton({ disabled: true })
    expect(api.keyboardHandlers['Enter']).toBeDefined()
    expect(api.keyboardHandlers[' ']).toBeDefined()
  })

  it('allows keyboard interaction when enabled', () => {
    const api = createButton()
    expect(api.keyboardHandlers['Enter']).toBeUndefined()
  })
})

describe('getButtonType', () => {
  it('defaults to button', () => {
    expect(getButtonType({})).toBe('button')
  })

  it('respects explicit type', () => {
    expect(getButtonType({ type: 'submit' })).toBe('submit')
  })
})

describe('buttonVariants', () => {
  it('returns default variant classes', () => {
    const classes = buttonVariants()
    expect(classes).toContain('bg-primary')
    expect(classes).toContain('h-9')
  })

  it('returns destructive variant', () => {
    const classes = buttonVariants({ variant: 'destructive' })
    expect(classes).toContain('bg-destructive')
  })

  it('returns size classes', () => {
    expect(buttonVariants({ size: 'sm' })).toContain('h-8')
    expect(buttonVariants({ size: 'lg' })).toContain('h-10')
    expect(buttonVariants({ size: 'xs' })).toContain('h-7')
    expect(buttonVariants({ size: 'icon' })).toContain('w-9')
  })

  it('appends custom className', () => {
    const classes = buttonVariants({ className: 'my-custom' })
    expect(classes).toContain('my-custom')
  })
})

describe('createButton - variant/size class coverage', () => {
  const allVariants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const

  it.each(allVariants)('variant "%s" produces unique classes', (variant) => {
    const classes = buttonVariants({ variant })
    expect(typeof classes).toBe('string')
    expect(classes.length).toBeGreaterThan(0)
  })

  it('all 6 variants produce different class strings', () => {
    const classSet = new Set(allVariants.map((v) => buttonVariants({ variant: v })))
    expect(classSet.size).toBe(6)
  })

  const allSizes = ['xs', 'sm', 'default', 'lg', 'icon'] as const

  it.each(allSizes)('size "%s" produces unique classes', (size) => {
    const classes = buttonVariants({ size })
    expect(typeof classes).toBe('string')
    expect(classes.length).toBeGreaterThan(0)
  })

  it('all 5 sizes produce different class strings', () => {
    const classSet = new Set(allSizes.map((s) => buttonVariants({ size: s })))
    expect(classSet.size).toBe(5)
  })
})

describe('createButton - compound variant + size combinations', () => {
  it('destructive + lg combines both variant and size classes', () => {
    const classes = buttonVariants({ variant: 'destructive', size: 'lg' })
    expect(classes).toContain('bg-destructive')
    expect(classes).toContain('h-10')
  })

  it('outline + sm combines both variant and size classes', () => {
    const classes = buttonVariants({ variant: 'outline', size: 'sm' })
    expect(classes).toContain('border')
    expect(classes).toContain('h-8')
  })

  it('ghost + xs combines both variant and size classes', () => {
    const classes = buttonVariants({ variant: 'ghost', size: 'xs' })
    expect(classes).toContain('hover:bg-accent')
    expect(classes).toContain('h-7')
  })

  it('link + icon combines both variant and size classes', () => {
    const classes = buttonVariants({ variant: 'link', size: 'icon' })
    expect(classes).toContain('underline-offset-4')
    expect(classes).toContain('w-9')
  })

  it('secondary + default combines both variant and size classes', () => {
    const classes = buttonVariants({ variant: 'secondary', size: 'default' })
    expect(classes).toContain('bg-secondary')
    expect(classes).toContain('h-9')
  })
})

describe('createButton - loading + disabled together', () => {
  it('both loading and disabled sets aria-disabled', () => {
    const api = createButton({ loading: true, disabled: true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.isInteractive).toBe(false)
  })

  it('both loading and disabled sets both data attributes', () => {
    const api = createButton({ loading: true, disabled: true })
    expect(api.dataAttributes['data-loading']).toBe('')
    expect(api.dataAttributes['data-disabled']).toBe('')
  })

  it('both loading and disabled produces keyboard handlers', () => {
    const api = createButton({ loading: true, disabled: true })
    expect(api.keyboardHandlers['Enter']).toBeDefined()
    expect(api.keyboardHandlers[' ']).toBeDefined()
  })
})

describe('createButton - asChild prop handling', () => {
  it('asChild does not affect the API output', () => {
    const withAsChild = createButton({ asChild: true })
    const without = createButton({ asChild: false })
    expect(withAsChild.isInteractive).toBe(without.isInteractive)
    expect(withAsChild.ariaProps).toEqual(without.ariaProps)
  })
})

describe('getButtonType - all types', () => {
  it('returns "button" by default', () => {
    expect(getButtonType({})).toBe('button')
  })

  it('returns "submit" when type is submit', () => {
    expect(getButtonType({ type: 'submit' })).toBe('submit')
  })

  it('returns "reset" when type is reset', () => {
    expect(getButtonType({ type: 'reset' })).toBe('reset')
  })

  it('returns "button" when type is explicitly button', () => {
    expect(getButtonType({ type: 'button' })).toBe('button')
  })
})

describe('createButton - dataAttributes are empty when no special state', () => {
  it('returns empty dataAttributes for default state', () => {
    const api = createButton()
    expect(api.dataAttributes).toEqual({})
  })

  it('returns empty dataAttributes when only variant/size are set', () => {
    const api = createButton({ variant: 'destructive', size: 'lg' })
    expect(api.dataAttributes).toEqual({})
  })
})

describe('createButton - keyboardHandlers preventDefault', () => {
  it('Enter handler calls preventDefault when disabled', () => {
    const api = createButton({ disabled: true })
    const event = { preventDefault: () => {} } as KeyboardEvent
    const spy = import.meta.jest?.spyOn?.(event, 'preventDefault') ?? (() => {
      let called = false
      const original = event.preventDefault
      event.preventDefault = () => { called = true; original.call(event) }
      return { called: () => called }
    })()
    // Use a simple mock approach
    let enterCalled = false
    const mockEvent = { preventDefault: () => { enterCalled = true } } as unknown as KeyboardEvent
    api.keyboardHandlers['Enter']!(mockEvent)
    expect(enterCalled).toBe(true)
  })

  it('Space handler calls preventDefault when disabled', () => {
    const api = createButton({ disabled: true })
    let spaceCalled = false
    const mockEvent = { preventDefault: () => { spaceCalled = true } } as unknown as KeyboardEvent
    api.keyboardHandlers[' ']!(mockEvent)
    expect(spaceCalled).toBe(true)
  })

  it('Enter handler calls preventDefault when loading', () => {
    const api = createButton({ loading: true })
    let called = false
    const mockEvent = { preventDefault: () => { called = true } } as unknown as KeyboardEvent
    api.keyboardHandlers['Enter']!(mockEvent)
    expect(called).toBe(true)
  })

  it('Space handler calls preventDefault when loading', () => {
    const api = createButton({ loading: true })
    let called = false
    const mockEvent = { preventDefault: () => { called = true } } as unknown as KeyboardEvent
    api.keyboardHandlers[' ']!(mockEvent)
    expect(called).toBe(true)
  })
})
