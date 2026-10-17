import { describe, it, expect } from 'vitest'
import {
  createIconButton,
  isIconButtonLabelValid,
  resolveIconButtonTapTarget,
  resolveIconButtonIconSize,
  iconButtonPxToRem,
  computeIconButtonTooltipPosition,
  iconButtonVariants,
  iconButtonHitAreaClass,
  ICON_BUTTON_DEFAULT_MIN_TAP_TARGET_PX,
  ICON_BUTTON_DEFAULT_ICON_SIZE_PX,
  ICON_BUTTON_SIZE_TO_BUTTON_SIZE,
  ICON_BUTTON_TOOLTIP_OFFSET_PX,
  ICON_BUTTON_TOOLTIP_VIEWPORT_MARGIN_PX,
} from '../src/index.js'

describe('isIconButtonLabelValid', () => {
  it('accepts a non-empty label', () => {
    expect(isIconButtonLabelValid('Mute')).toBe(true)
  })

  it.each(['', '   ', undefined, null])('rejects %j', (label) => {
    expect(isIconButtonLabelValid(label)).toBe(false)
  })
})

describe('resolveIconButtonTapTarget', () => {
  it('defaults to 44 px', () => {
    expect(ICON_BUTTON_DEFAULT_MIN_TAP_TARGET_PX).toBe(44)
    expect(resolveIconButtonTapTarget(undefined)).toBe(44)
  })

  it('keeps a valid explicit value, including 0 (no extension)', () => {
    expect(resolveIconButtonTapTarget(48)).toBe(48)
    expect(resolveIconButtonTapTarget(0)).toBe(0)
  })

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('falls back for %s', (value) => {
    expect(resolveIconButtonTapTarget(value)).toBe(ICON_BUTTON_DEFAULT_MIN_TAP_TARGET_PX)
  })
})

describe('resolveIconButtonIconSize', () => {
  it('uses the per-size default when omitted', () => {
    expect(resolveIconButtonIconSize('xs', undefined)).toBe(ICON_BUTTON_DEFAULT_ICON_SIZE_PX.xs)
    expect(resolveIconButtonIconSize('sm', undefined)).toBe(ICON_BUTTON_DEFAULT_ICON_SIZE_PX.sm)
    expect(resolveIconButtonIconSize('default', undefined)).toBe(
      ICON_BUTTON_DEFAULT_ICON_SIZE_PX.default,
    )
  })

  it('prefers a positive explicit size', () => {
    expect(resolveIconButtonIconSize('default', 20)).toBe(20)
  })

  it.each([0, -4, Number.NaN])('ignores invalid %s', (value) => {
    expect(resolveIconButtonIconSize('sm', value)).toBe(ICON_BUTTON_DEFAULT_ICON_SIZE_PX.sm)
  })
})

describe('iconButtonPxToRem', () => {
  it('converts against a 16 px root', () => {
    expect(iconButtonPxToRem(16)).toBe('1rem')
    expect(iconButtonPxToRem(20)).toBe('1.25rem')
  })
})

describe('createIconButton', () => {
  it('names the button with the label and renders a plain button by default', () => {
    const api = createIconButton({ label: 'Settings' })
    expect(api.ariaProps).toEqual({ 'aria-label': 'Settings' })
    expect(api.dataAttributes).toEqual({})
  })

  it('exposes aria-pressed and data-state in toggle form', () => {
    const on = createIconButton({ label: 'Mute', pressed: true })
    expect(on.ariaProps['aria-pressed']).toBe(true)
    expect(on.dataAttributes['data-state']).toBe('on')

    const off = createIconButton({ label: 'Mute', pressed: false })
    expect(off.ariaProps['aria-pressed']).toBe(false)
    expect(off.dataAttributes['data-state']).toBe('off')
  })

  it('maps visual sizes onto Button icon sizes', () => {
    expect(createIconButton({ label: 'a' }).buttonSize).toBe('icon')
    expect(createIconButton({ label: 'a', size: 'sm' }).buttonSize).toBe('icon-sm')
    expect(createIconButton({ label: 'a', size: 'xs' }).buttonSize).toBe('icon-xs')
    expect(ICON_BUTTON_SIZE_TO_BUTTON_SIZE).toEqual({
      xs: 'icon-xs',
      sm: 'icon-sm',
      default: 'icon',
    })
  })

  it('defaults to the ghost variant and canonicalises aliases', () => {
    expect(createIconButton({ label: 'a' }).variant).toBe('ghost')
    expect(createIconButton({ label: 'a', variant: 'primary' }).variant).toBe('default')
    expect(createIconButton({ label: 'a', variant: 'destructive' }).variant).toBe('destructive')
  })

  it('applies the built-in pressed fill only to a pressed ghost button', () => {
    expect(createIconButton({ label: 'a', pressed: true }).pressedGhost).toBe('true')
    expect(createIconButton({ label: 'a', pressed: false }).pressedGhost).toBe('false')
    expect(createIconButton({ label: 'a' }).pressedGhost).toBe('false')
    expect(
      createIconButton({ label: 'a', pressed: true, variant: 'secondary' }).pressedGhost,
    ).toBe('false')
  })

  it('sizes the hit area from minTapTarget', () => {
    expect(createIconButton({ label: 'a' }).hitAreaStyle).toEqual({
      minWidth: '44px',
      minHeight: '44px',
    })
    expect(createIconButton({ label: 'a', minTapTarget: 48 }).hitAreaStyle).toEqual({
      minWidth: '48px',
      minHeight: '48px',
    })
  })

  it('sizes the glyph in rem', () => {
    expect(createIconButton({ label: 'a' }).iconStyle).toEqual({ width: '1rem', height: '1rem' })
    expect(createIconButton({ label: 'a', iconSize: 24 }).iconStyle).toEqual({
      width: '1.5rem',
      height: '1.5rem',
    })
  })

  it('enables the tooltip unless turned off, disabled, or unlabeled', () => {
    expect(createIconButton({ label: 'a' }).tooltipEnabled).toBe(true)
    expect(createIconButton({ label: 'a', showTooltip: false }).tooltipEnabled).toBe(false)
    expect(createIconButton({ label: 'a', disabled: true }).tooltipEnabled).toBe(false)
    expect(createIconButton({ label: ' ' }).tooltipEnabled).toBe(false)
  })
})

describe('computeIconButtonTooltipPosition', () => {
  const viewport = { width: 1000, height: 800 }
  const tooltip = { width: 60, height: 24 }
  const offset = ICON_BUTTON_TOOLTIP_OFFSET_PX
  const margin = ICON_BUTTON_TOOLTIP_VIEWPORT_MARGIN_PX

  it('centres the tooltip above the button when it fits', () => {
    const trigger = { top: 200, left: 400, width: 36, height: 36 }
    expect(computeIconButtonTooltipPosition({ trigger, tooltip, viewport })).toEqual({
      side: 'top',
      top: 200 - offset - 24,
      left: 400 + 18 - 30,
    })
  })

  it('flips below when there is no room above', () => {
    const trigger = { top: 4, left: 400, width: 36, height: 36 }
    const pos = computeIconButtonTooltipPosition({ trigger, tooltip, viewport })
    expect(pos.side).toBe('bottom')
    expect(pos.top).toBe(4 + 36 + offset)
  })

  it('stays above when the space is exactly the margin', () => {
    const trigger = { top: margin + offset + 24, left: 400, width: 36, height: 36 }
    expect(computeIconButtonTooltipPosition({ trigger, tooltip, viewport }).side).toBe('top')
  })

  it('clamps to the left viewport edge', () => {
    const trigger = { top: 200, left: 0, width: 36, height: 36 }
    expect(computeIconButtonTooltipPosition({ trigger, tooltip, viewport }).left).toBe(margin)
  })

  it('clamps to the right viewport edge', () => {
    const trigger = { top: 200, left: 980, width: 20, height: 20 }
    expect(computeIconButtonTooltipPosition({ trigger, tooltip, viewport }).left).toBe(
      1000 - margin - 60,
    )
  })

  it('pins to the start margin when the tooltip is wider than the viewport', () => {
    const trigger = { top: 200, left: 50, width: 36, height: 36 }
    const pos = computeIconButtonTooltipPosition({
      trigger,
      tooltip: { width: 400, height: 24 },
      viewport: { width: 300, height: 800 },
    })
    expect(pos.left).toBe(margin)
  })

  it('honours custom offset and margin', () => {
    const trigger = { top: 200, left: 400, width: 36, height: 36 }
    const pos = computeIconButtonTooltipPosition({
      trigger,
      tooltip,
      viewport,
      offset: 10,
      margin: 0,
    })
    expect(pos.top).toBe(200 - 10 - 24)
  })
})

describe('styles', () => {
  it('adds the ghost pressed fill only when asked', () => {
    expect(iconButtonVariants({ pressedGhost: 'true' })).toContain('bg-accent')
    expect(iconButtonVariants()).not.toContain('bg-accent')
  })

  it('stops transitions under reduced motion and keeps a visible ring colour', () => {
    const classes = iconButtonVariants()
    expect(classes).toContain('motion-reduce:transition-none')
    expect(classes).toContain('focus-visible:ring-ring')
  })

  it('centres the hit area absolutely so it takes no layout space', () => {
    expect(iconButtonHitAreaClass).toContain('absolute')
    expect(iconButtonHitAreaClass).toContain('-translate-x-1/2')
  })
})
