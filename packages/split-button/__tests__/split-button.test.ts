import { describe, it, expect } from 'vitest'
import { buttonVariants, type ButtonVariant } from '@refraction-ui/button'
import { ICON_BUTTON_DEFAULT_MIN_TAP_TARGET_PX } from '@refraction-ui/icon-button'
import {
  createSplitButton,
  createSplitButtonTrigger,
  resolveSplitButtonMenuLabel,
  resolveSplitButtonDivider,
  resolveSplitButtonDirection,
  resolveSplitButtonMenuAlign,
  isSplitButtonPartDisabled,
  getSplitButtonTriggerKeyIntent,
  splitButtonGroupClass,
  splitButtonActionClass,
  splitButtonTriggerVariants,
  splitButtonHitAreaVariants,
  SPLIT_BUTTON_DEFAULT_MENU_LABEL,
  SPLIT_BUTTON_DEFAULT_MENU_ALIGN,
  SPLIT_BUTTON_DEFAULT_VARIANT,
  SPLIT_BUTTON_DEFAULT_SIZE,
} from '../src/index.js'

const classes = (value: string) => value.split(/\s+/)

describe('resolveSplitButtonMenuLabel', () => {
  it('names the caret "More options" by default', () => {
    expect(SPLIT_BUTTON_DEFAULT_MENU_LABEL).toBe('More options')
    expect(resolveSplitButtonMenuLabel(undefined)).toBe('More options')
  })

  it('keeps a caller-supplied label', () => {
    expect(resolveSplitButtonMenuLabel('Microphone options')).toBe('Microphone options')
  })

  it.each(['', '   ', null])('falls back for %j, so the caret is never unnamed', (label) => {
    expect(resolveSplitButtonMenuLabel(label)).toBe(SPLIT_BUTTON_DEFAULT_MENU_LABEL)
  })
})

describe('resolveSplitButtonDivider', () => {
  it('shares the border of a bordered variant', () => {
    expect(resolveSplitButtonDivider('outline')).toBe('shared-border')
  })

  it.each<ButtonVariant>(['default', 'destructive', 'secondary', 'ghost', 'link', 'soft', 'tertiary'])(
    'draws a hairline for %s',
    (variant) => {
      expect(resolveSplitButtonDivider(variant)).toBe('hairline')
    },
  )
})

describe('isSplitButtonPartDisabled', () => {
  it('is enabled only when neither the group nor the part is disabled', () => {
    expect(isSplitButtonPartDisabled(undefined, undefined)).toBe(false)
    expect(isSplitButtonPartDisabled(false, false)).toBe(false)
  })

  it('follows the group', () => {
    expect(isSplitButtonPartDisabled(true, undefined)).toBe(true)
    // A part cannot opt back in while the whole control is disabled.
    expect(isSplitButtonPartDisabled(true, false)).toBe(true)
  })

  it('lets one part be disabled on its own', () => {
    expect(isSplitButtonPartDisabled(false, true)).toBe(true)
  })
})

describe('getSplitButtonTriggerKeyIntent', () => {
  it('opens a closed menu on ArrowDown', () => {
    expect(getSplitButtonTriggerKeyIntent({ key: 'ArrowDown', open: false, disabled: false })).toBe('open')
  })

  it('does nothing extra once the menu is open', () => {
    expect(getSplitButtonTriggerKeyIntent({ key: 'ArrowDown', open: true, disabled: false })).toBeNull()
  })

  it('does nothing while disabled', () => {
    expect(getSplitButtonTriggerKeyIntent({ key: 'ArrowDown', open: false, disabled: true })).toBeNull()
  })

  it.each(['Enter', ' ', 'ArrowUp', 'Escape', 'Tab'])(
    'leaves %j to the native button and the menu',
    (key) => {
      expect(getSplitButtonTriggerKeyIntent({ key, open: false, disabled: false })).toBeNull()
    },
  )
})

describe('resolveSplitButtonDirection', () => {
  it('reads rtl', () => {
    expect(resolveSplitButtonDirection('rtl')).toBe('rtl')
  })

  it.each(['ltr', '', undefined, null, 'auto'])('treats %j as ltr', (value) => {
    expect(resolveSplitButtonDirection(value)).toBe('ltr')
  })
})

describe('resolveSplitButtonMenuAlign', () => {
  it('defaults to the end edge', () => {
    expect(SPLIT_BUTTON_DEFAULT_MENU_ALIGN).toBe('end')
  })

  it('passes alignment through left-to-right', () => {
    expect(resolveSplitButtonMenuAlign('start', 'ltr')).toBe('start')
    expect(resolveSplitButtonMenuAlign('center', 'ltr')).toBe('center')
    expect(resolveSplitButtonMenuAlign('end', 'ltr')).toBe('end')
  })

  it('mirrors start and end right-to-left', () => {
    expect(resolveSplitButtonMenuAlign('start', 'rtl')).toBe('end')
    expect(resolveSplitButtonMenuAlign('center', 'rtl')).toBe('center')
    expect(resolveSplitButtonMenuAlign('end', 'rtl')).toBe('start')
  })
})

describe('createSplitButton', () => {
  it('defaults to Button’s default variant and size', () => {
    const api = createSplitButton()
    expect(SPLIT_BUTTON_DEFAULT_VARIANT).toBe('default')
    expect(SPLIT_BUTTON_DEFAULT_SIZE).toBe('default')
    expect(api.variant).toBe('default')
    expect(api.size).toBe('default')
    expect(api.divider).toBe('hairline')
  })

  it('canonicalises Button’s variant aliases', () => {
    expect(createSplitButton({ variant: 'primary' }).variant).toBe('default')
  })

  it('passes every Button size through', () => {
    expect(createSplitButton({ size: 'lg' }).size).toBe('lg')
    expect(createSplitButton({ size: 'icon' }).size).toBe('icon')
  })

  it('picks the divider from the variant', () => {
    expect(createSplitButton({ variant: 'outline' }).divider).toBe('shared-border')
  })

  it('is a group', () => {
    expect(createSplitButton().ariaProps).toEqual({ role: 'group' })
  })

  it('exposes open and disabled state as data attributes', () => {
    expect(createSplitButton().dataAttributes).toEqual({ 'data-state': 'closed' })
    expect(createSplitButton({ open: true, disabled: true }).dataAttributes).toEqual({
      'data-state': 'open',
      'data-disabled': '',
    })
  })

  it('extends each part’s hit area to 44 px by default, or to minTapTarget', () => {
    expect(ICON_BUTTON_DEFAULT_MIN_TAP_TARGET_PX).toBe(44)
    expect(createSplitButton().hitAreaStyle).toEqual({ minWidth: '44px', minHeight: '44px' })
    expect(createSplitButton({ minTapTarget: 48 }).hitAreaStyle).toEqual({
      minWidth: '48px',
      minHeight: '48px',
    })
    expect(createSplitButton({ minTapTarget: -1 }).hitAreaStyle.minWidth).toBe('44px')
  })
})

describe('createSplitButtonTrigger', () => {
  it('names the caret and reports the menu state', () => {
    expect(createSplitButtonTrigger({ open: false, disabled: false })).toEqual({
      ariaProps: { 'aria-label': 'More options' },
      dataAttributes: { 'data-state': 'closed' },
    })
  })

  it('uses a caller-supplied name', () => {
    const api = createSplitButtonTrigger({ label: 'Camera options', open: true, disabled: false })
    expect(api.ariaProps['aria-label']).toBe('Camera options')
    expect(api.dataAttributes['data-state']).toBe('open')
  })

  it('carries Button’s disabled attributes', () => {
    const api = createSplitButtonTrigger({ open: false, disabled: true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.dataAttributes['data-disabled']).toBe('')
  })
})

describe('styles', () => {
  it('lays the parts out in one row and contains their stacking', () => {
    expect(classes(splitButtonGroupClass)).toEqual(
      expect.arrayContaining(['inline-flex', 'items-stretch', 'isolate', 'relative']),
    )
  })

  it('squares the corners where the parts meet, in logical terms', () => {
    expect(classes(splitButtonActionClass)).toContain('rounded-e-none')
    expect(classes(splitButtonTriggerVariants())).toContain('rounded-s-none')
  })

  it('gives both parts a token focus ring that rises above the other part', () => {
    for (const value of [splitButtonActionClass, splitButtonTriggerVariants()]) {
      expect(classes(value)).toEqual(
        expect.arrayContaining([
          'focus-visible:z-10',
          'focus-visible:ring-ring',
          'focus-visible:ring-offset-background',
          'motion-reduce:transition-none',
        ]),
      )
    }
  })

  it('makes the caret a square without the size’s horizontal padding', () => {
    expect(classes(splitButtonTriggerVariants())).toEqual(
      expect.arrayContaining(['aspect-square', 'ps-0', 'pe-0', 'relative']),
    )
  })

  it('divides with a shared border or a translucent text-colour hairline', () => {
    expect(classes(splitButtonTriggerVariants({ divider: 'shared-border' }))).toContain('-ms-px')
    expect(classes(splitButtonTriggerVariants({ divider: 'hairline' }))).toEqual(
      expect.arrayContaining(['border-s', 'border-s-current/25']),
    )
    expect(splitButtonTriggerVariants()).toBe(splitButtonTriggerVariants({ divider: 'hairline' }))
  })

  it('pins each hit area to the seam so the two never overlap', () => {
    expect(classes(splitButtonHitAreaVariants({ part: 'action' }))).toContain('end-0')
    expect(classes(splitButtonHitAreaVariants({ part: 'trigger' }))).toContain('start-0')
    expect(classes(splitButtonHitAreaVariants({ part: 'action' }))).toContain('absolute')
  })

  it('stacks each hit area beneath the parts, inside the isolated group', () => {
    for (const part of ['action', 'trigger'] as const) {
      expect(classes(splitButtonHitAreaVariants({ part }))).toContain('-z-10')
    }
    expect(classes(splitButtonGroupClass)).toContain('isolate')
  })

  it('uses tokens only: no raw colour values in any class', () => {
    const all = [
      splitButtonGroupClass,
      splitButtonActionClass,
      splitButtonTriggerVariants({ divider: 'shared-border' }),
      splitButtonTriggerVariants({ divider: 'hairline' }),
      splitButtonHitAreaVariants({ part: 'action' }),
      splitButtonHitAreaVariants({ part: 'trigger' }),
    ].join(' ')
    expect(all).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|\[(?:#|rgb|hsl)/i)
  })

  it('layers on Button’s own size classes rather than a second size table', () => {
    // The caret takes the action's size class, so heights always agree.
    expect(buttonVariants({ size: 'lg' })).toContain('h-10')
    expect(splitButtonTriggerVariants()).not.toMatch(/\bh-\d/)
  })
})
