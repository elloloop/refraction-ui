import * as React from 'react'
import {
  createIconButton,
  computeIconButtonTooltipPosition,
  isIconButtonLabelValid,
  iconButtonVariants,
  iconButtonHitAreaClass,
  iconButtonIconClass,
  iconButtonTooltipTriggerClass,
  iconButtonTooltipClass,
  ICON_BUTTON_TOOLTIP_DELAY_MS,
  type IconButtonSize,
  type IconButtonTooltipPosition,
} from '@refraction-ui/icon-button'
import { Button, type ButtonVariant } from '@refraction-ui/react-button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@refraction-ui/react-tooltip'
import { cn, devWarn } from '@refraction-ui/shared'

export type { IconButtonSize, ButtonVariant as IconButtonVariant }

export interface IconButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    // The icon is the only content, and `label` owns the accessible name and
    // the toggle state is driven by `pressed`.
    'children' | 'aria-label' | 'aria-pressed'
  > {
  /** The glyph. Rendered `aria-hidden`; the name comes from `label`. */
  icon: React.ReactNode
  /** Required accessible name; also the tooltip text. */
  label: string
  /** Show `label` as a tooltip on hover and keyboard focus. */
  showTooltip?: boolean
  /** Button variant. */
  variant?: ButtonVariant
  /** Visual size (maps onto Button's square icon sizes). */
  size?: IconButtonSize
  /** Glyph size in CSS pixels. Defaults per `size`. */
  iconSize?: number
  /** Minimum hit area in CSS pixels; extends past the visual box without moving layout. */
  minTapTarget?: number
  /** Toggle state → `aria-pressed`. Omit for a plain (non-toggle) button. */
  pressed?: boolean
}

const ESCAPE_KEY = 'Escape'

// useLayoutEffect warns during SSR on React 18; the measurement only matters
// in the browser.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

function viewportSize() {
  const root = document.documentElement
  return {
    width: root.clientWidth || window.innerWidth,
    height: root.clientHeight || window.innerHeight,
  }
}

/**
 * Open state + viewport placement for the label tooltip. Tooltip owns the
 * hover/focus delay; this hook adds the disabled gate, Escape dismissal
 * (WCAG 1.4.13) and placement next to the button.
 */
function useIconButtonTooltip(
  enabled: boolean,
  buttonRef: React.RefObject<HTMLButtonElement | null>,
) {
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState<IconButtonTooltipPosition | null>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  // After Escape, stay closed until the pointer/focus leaves; otherwise a
  // pending hover/focus delay would reopen it straight away.
  const dismissedRef = React.useRef(false)
  const isOpen = enabled && open

  const onOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) {
        dismissedRef.current = false
        setOpen(false)
        setPosition(null)
        return
      }
      if (!enabled || dismissedRef.current) return
      setOpen(true)
    },
    [enabled],
  )

  const dismiss = React.useCallback(() => {
    dismissedRef.current = true
    setOpen(false)
    setPosition(null)
  }, [])

  React.useEffect(() => {
    if (!enabled) setOpen(false)
  }, [enabled])

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) return
    const trigger = buttonRef.current
    const content = contentRef.current
    if (!trigger || !content) return
    setPosition(
      computeIconButtonTooltipPosition({
        trigger: trigger.getBoundingClientRect(),
        tooltip: { width: content.offsetWidth, height: content.offsetHeight },
        viewport: viewportSize(),
      }),
    )
  }, [isOpen, buttonRef])

  // Rendered hidden at the origin for the first (measuring) pass.
  const contentStyle: React.CSSProperties = position
    ? { top: position.top, left: position.left }
    : { top: 0, left: 0, visibility: 'hidden' }

  return { isOpen, onOpenChange, dismiss, contentRef, contentStyle, side: position?.side ?? 'top' }
}

/**
 * IconButton — an icon-only button that cannot ship without a name.
 *
 * `label` is the accessible name and the tooltip text (shown on hover and on
 * keyboard focus, dismissible with Escape). The tooltip is `aria-hidden` and
 * not wired as a description, so screen readers hear the name once. An
 * invisible absolutely positioned box extends the hit area to `minTapTarget`
 * (44 px by default) without changing the visual size or the layout. Passing
 * `pressed` turns it into a toggle (`aria-pressed`). Built on `Button`, so it
 * shares Button's variants, focus ring and disabled behaviour.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      label,
      showTooltip = true,
      variant,
      size = 'default',
      iconSize,
      minTapTarget,
      pressed,
      disabled = false,
      className,
      onKeyDown,
      ...props
    },
    ref,
  ) {
    if (!isIconButtonLabelValid(label)) {
      devWarn(
        'react-icon-button/missing-label',
        'IconButton needs a non-empty `label`: it is the only accessible name an icon-only button has.',
      )
    }

    const api = createIconButton({
      label,
      variant,
      size,
      iconSize,
      minTapTarget,
      pressed,
      disabled,
      showTooltip,
    })

    const buttonRef = React.useRef<HTMLButtonElement | null>(null)
    const setRefs = React.useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const tooltip = useIconButtonTooltip(api.tooltipEnabled, buttonRef)

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Dismiss even while the show-delay is pending, so the tooltip doesn't
      // pop up right after Escape. Don't stop propagation: Escape should still
      // reach an enclosing dialog.
      if (event.key === ESCAPE_KEY) tooltip.dismiss()
      onKeyDown?.(event)
    }

    // The trigger wrapper is always rendered (display: contents) so toggling
    // `disabled`/`showTooltip` never remounts the button and drops focus.
    return (
      <Tooltip
        open={tooltip.isOpen}
        onOpenChange={tooltip.onOpenChange}
        delayDuration={ICON_BUTTON_TOOLTIP_DELAY_MS}
      >
        <TooltipTrigger aria-describedby={undefined} className={iconButtonTooltipTriggerClass}>
          <Button
            ref={setRefs}
            variant={api.variant}
            size={api.buttonSize}
            disabled={disabled}
            className={cn(iconButtonVariants({ pressedGhost: api.pressedGhost }), className)}
            {...api.ariaProps}
            {...api.dataAttributes}
            {...props}
            onKeyDown={handleKeyDown}
          >
            <span
              aria-hidden="true"
              data-icon-button-hit-area=""
              className={iconButtonHitAreaClass}
              style={api.hitAreaStyle}
            />
            <span aria-hidden="true" className={iconButtonIconClass} style={api.iconStyle}>
              {icon}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent
          ref={tooltip.contentRef}
          // The label is already the accessible name; exposing it again as a
          // tooltip/description would make screen readers say it twice.
          aria-hidden="true"
          side={tooltip.side}
          className={iconButtonTooltipClass}
          style={tooltip.contentStyle}
        >
          {label}
        </TooltipContent>
      </Tooltip>
    )
  },
)
