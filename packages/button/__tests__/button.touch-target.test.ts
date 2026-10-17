import { describe, it, expect } from 'vitest'
import { createButton } from '../src/button.js'
import { buttonTouchTargetStyles, buttonVariants } from '../src/button.styles.js'

const ICON_SIZES = [
  { size: 'icon', box: 'h-9 w-9' },
  { size: 'icon-sm', box: 'h-8 w-8' },
  { size: 'icon-xs', box: 'h-7 w-7' },
] as const

const tokens = (classes: string) => classes.split(/\s+/)

describe('buttonTouchTargetStyles', () => {
  it('grows the hit area to at least 44 CSS px, scaling with the root text size', () => {
    expect(tokens(buttonTouchTargetStyles)).toEqual(
      expect.arrayContaining([
        'after:absolute',
        'after:min-h-[max(44px,2.75rem)]',
        'after:min-w-[max(44px,2.75rem)]',
        "after:content-['']",
      ]),
    )
  })

  it('centres the hit area on the button', () => {
    expect(tokens(buttonTouchTargetStyles)).toEqual(
      expect.arrayContaining([
        'after:left-1/2',
        'after:top-1/2',
        'after:-translate-x-1/2',
        'after:-translate-y-1/2',
      ]),
    )
  })

  it('positions the button with zero specificity so a consumer position class still wins', () => {
    const classes = tokens(buttonTouchTargetStyles)
    expect(classes).toContain('[:where(&)]:relative')
    expect(classes).not.toContain('relative')
  })

  it('adds nothing visible: no colour, border, padding or size utilities on the button itself', () => {
    const onButton = tokens(buttonTouchTargetStyles).filter((c) => !c.startsWith('after:'))
    expect(onButton).toEqual(['[:where(&)]:relative'])
  })
})

describe('buttonVariants touchTarget', () => {
  it('is off by default, so existing buttons render the same classes', () => {
    expect(buttonVariants()).toBe(buttonVariants({ touchTarget: 'false' }))
    expect(buttonVariants({ size: 'icon' })).not.toContain('after:min-h-')
  })

  it.each(ICON_SIZES)('extends the $size hit area and keeps its $box visual box', ({ size, box }) => {
    const classes = buttonVariants({ size, touchTarget: 'true' })
    expect(classes).toContain(buttonTouchTargetStyles)
    expect(classes).toContain(box)
  })

  it.each(ICON_SIZES)('leaves the $size layout untouched apart from the hit area', ({ size }) => {
    const without = buttonVariants({ size })
    const withTarget = buttonVariants({ size, touchTarget: 'true' })
    expect(withTarget).toBe(`${without} ${buttonTouchTargetStyles}`)
  })
})

describe('createButton touchTarget', () => {
  it('marks the button with data-touch-target when enabled', () => {
    expect(createButton({ touchTarget: true }).dataAttributes).toHaveProperty('data-touch-target', '')
  })

  it('adds no data attribute by default', () => {
    expect(createButton().dataAttributes).not.toHaveProperty('data-touch-target')
    expect(createButton({ touchTarget: false }).dataAttributes).not.toHaveProperty('data-touch-target')
  })

  it('does not change the interactive state', () => {
    const api = createButton({ touchTarget: true })
    expect(api.isInteractive).toBe(true)
    expect(api.ariaProps).toEqual(createButton().ariaProps)
  })
})
