import * as React from 'react'
import {
  createColorChip,
  colorChipEditLabelIncludesLabel,
  colorChipVariants,
  colorChipWashClasses,
  colorChipDotClasses,
  colorChipDotClass,
  colorChipLabelClass,
  colorChipSeparatorClass,
  colorChipHintClass,
  colorChipEditIconClass,
  colorChipSrOnlyClass,
  type ColorChipCategory,
} from '@refraction-ui/color-chip'
import {
  computeIconButtonTooltipPosition,
  iconButtonHitAreaClass,
  iconButtonTooltipClass,
  iconButtonTooltipTriggerClass,
  ICON_BUTTON_DEFAULT_MIN_TAP_TARGET_PX,
  ICON_BUTTON_TOOLTIP_DELAY_MS,
  type IconButtonTooltipPosition,
} from '@refraction-ui/icon-button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@refraction-ui/react-tooltip'
import { cn, devWarn } from '@refraction-ui/shared'

export interface ColorChipProps
  extends Omit<
    React.HTMLAttributes<HTMLElement>,
    // Content comes from `label` / `hint`; the edit button's name from `editLabel`.
    'children' | 'aria-label'
  > {
  /** Visible text. Always shown, so the chip never relies on colour alone. */
  label: string
  /** Dot colour (category 1–8). Defaults to `colorFor(label)`. */
  dot?: ColorChipCategory
  /** Wash colour (category 1–8); the text follows it. Defaults to `dot`. */
  wash?: ColorChipCategory
  /** Secondary text after the label, e.g. "from the calendar". */
  hint?: string
  /** Makes the whole chip one edit button; called when it is activated. */
  onEdit?: () => void
  /** Accessible name of the edit button. Defaults to `Edit <label>`. */
  editLabel?: string
  /** Tooltip on hover / keyboard focus. Defaults to `editLabel`; `''` turns it off. */
  editTooltip?: string
}

const ESCAPE_KEY = 'Escape'

/** Hit area for the edit button, shared with IconButton (WCAG 2.5.5). */
const HIT_AREA_STYLE: React.CSSProperties = {
  minWidth: ICON_BUTTON_DEFAULT_MIN_TAP_TARGET_PX,
  minHeight: ICON_BUTTON_DEFAULT_MIN_TAP_TARGET_PX,
}

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
 * Open state + placement for the edit tooltip. Tooltip's content is portaled
 * without positioning, so — like IconButton — measure the chip and place the
 * tooltip with `position: fixed` via the shared pure
 * `computeIconButtonTooltipPosition`. Escape dismisses it (WCAG 1.4.13).
 */
function useColorChipTooltip(enabled: boolean, triggerRef: React.RefObject<HTMLElement | null>) {
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
    const trigger = triggerRef.current
    const content = contentRef.current
    if (!trigger || !content) return
    setPosition(
      computeIconButtonTooltipPosition({
        trigger: trigger.getBoundingClientRect(),
        tooltip: { width: content.offsetWidth, height: content.offsetHeight },
        viewport: viewportSize(),
      }),
    )
  }, [isOpen, triggerRef])

  // Rendered hidden at the origin for the first (measuring) pass.
  const contentStyle: React.CSSProperties = position
    ? { top: position.top, left: position.left }
    : { top: 0, left: 0, visibility: 'hidden' }

  return { isOpen, onOpenChange, dismiss, contentRef, contentStyle, side: position?.side ?? 'top' }
}

/** Pencil glyph marking the chip as editable (a non-colour cue). */
function EditGlyph() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={colorChipEditIconClass}
      data-color-chip-edit-icon=""
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function joinIds(...ids: (string | undefined)[]): string | undefined {
  const joined = ids.filter(Boolean).join(' ')
  return joined.length > 0 ? joined : undefined
}

/**
 * ColorChip — a label with a categorical colour (a dot on a pale wash) and an
 * optional hint. Read-only chips are a plain, non-interactive `<span>`. With
 * `onEdit` the whole chip becomes one `<button>` named by `editLabel`, with a
 * tooltip (`editTooltip`) on hover and keyboard focus, a pencil glyph, a
 * visible focus ring and a 44 px hit area.
 */
export const ColorChip = React.forwardRef<HTMLElement, ColorChipProps>(function ColorChip(
  {
    label,
    dot,
    wash,
    hint,
    onEdit,
    editLabel,
    editTooltip,
    className,
    onClick,
    onKeyDown,
    'aria-describedby': describedByProp,
    ...props
  },
  ref,
) {
  const editable = onEdit !== undefined
  const hintId = React.useId()
  const tooltipDescriptionId = React.useId()

  const api = createColorChip({
    label,
    dot,
    wash,
    hint,
    editable,
    editLabel,
    editTooltip,
    hintId,
    tooltipDescriptionId,
  })

  if (label.trim().length === 0) {
    devWarn(
      'react-color-chip/missing-label',
      'ColorChip needs a non-empty `label`: the text is what tells chips apart without relying on colour.',
    )
  }
  if (api.editLabel !== undefined && !colorChipEditLabelIncludesLabel(api.editLabel, label)) {
    devWarn(
      'react-color-chip/label-not-in-name',
      'ColorChip `editLabel` should contain the visible `label` (WCAG 2.5.3) so voice-control users can say what they see.',
      { label, editLabel: api.editLabel },
    )
  }

  const triggerRef = React.useRef<HTMLElement | null>(null)
  const setRefs = React.useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  const tooltip = useColorChipTooltip(api.tooltip !== undefined, triggerRef)

  const rootClassName = cn(
    colorChipVariants({ editable: editable ? 'true' : 'false' }),
    colorChipWashClasses[api.wash],
    className,
  )

  const content = (
    <>
      <span aria-hidden="true" className={cn(colorChipDotClass, colorChipDotClasses[api.dot])} />
      <span className={colorChipLabelClass}>{label}</span>
      {api.hint !== undefined && (
        <>
          <span aria-hidden="true" className={colorChipSeparatorClass}>
            ·
          </span>
          <span id={hintId} className={colorChipHintClass}>
            {api.hint}
          </span>
        </>
      )}
    </>
  )

  if (!editable) {
    return (
      <span
        ref={setRefs}
        className={rootClassName}
        aria-describedby={describedByProp}
        {...api.dataAttributes}
        {...props}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        {content}
      </span>
    )
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event)
    onEdit()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    // Dismiss even while the show-delay is pending. Don't stop propagation:
    // Escape should still reach an enclosing dialog.
    if (event.key === ESCAPE_KEY) tooltip.dismiss()
    onKeyDown?.(event)
  }

  return (
    <Tooltip
      open={tooltip.isOpen}
      onOpenChange={tooltip.onOpenChange}
      delayDuration={ICON_BUTTON_TOOLTIP_DELAY_MS}
    >
      <TooltipTrigger aria-describedby={undefined} className={iconButtonTooltipTriggerClass}>
        <button
          ref={setRefs}
          type="button"
          className={rootClassName}
          {...api.dataAttributes}
          {...props}
          {...api.ariaProps}
          aria-describedby={joinIds(describedByProp, api.ariaProps['aria-describedby'])}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          <span
            aria-hidden="true"
            data-color-chip-hit-area=""
            className={iconButtonHitAreaClass}
            style={HIT_AREA_STYLE}
          />
          {content}
          <EditGlyph />
          {api.describeTooltip && (
            <span id={tooltipDescriptionId} className={colorChipSrOnlyClass}>
              {api.tooltip}
            </span>
          )}
        </button>
      </TooltipTrigger>
      {api.tooltip !== undefined && (
        <TooltipContent
          ref={tooltip.contentRef}
          // Screen readers get the name from aria-label and any extra tooltip
          // text from the sr-only description, so the floating copy is hidden.
          aria-hidden="true"
          side={tooltip.side}
          className={iconButtonTooltipClass}
          style={tooltip.contentStyle}
        >
          {api.tooltip}
        </TooltipContent>
      )}
    </Tooltip>
  )
})
