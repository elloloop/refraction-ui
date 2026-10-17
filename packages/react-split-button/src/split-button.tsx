import * as React from 'react'
import { buttonVariants } from '@refraction-ui/button'
import {
  createSplitButton,
  createSplitButtonTrigger,
  getSplitButtonTriggerKeyIntent,
  isSplitButtonPartDisabled,
  resolveSplitButtonDirection,
  resolveSplitButtonMenuAlign,
  splitButtonActionClass,
  splitButtonCaretClass,
  splitButtonGroupClass,
  splitButtonHitAreaVariants,
  splitButtonTriggerVariants,
  SPLIT_BUTTON_DEFAULT_MENU_ALIGN,
  type SplitButtonAPI,
  type SplitButtonDirection,
  type SplitButtonMenuAlign,
} from '@refraction-ui/split-button'
import { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from '@refraction-ui/react-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  type DropdownMenuContentProps,
} from '@refraction-ui/react-dropdown-menu'
import { cn, devWarn } from '@refraction-ui/shared'

export type { ButtonSize as SplitButtonSize, ButtonVariant as SplitButtonVariant, SplitButtonMenuAlign }

// useLayoutEffect warns during SSR on React 18; these effects only matter in
// the browser.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SplitButtonContextValue {
  api: SplitButtonAPI
  disabled: boolean
  open: boolean
  setOpen: (open: boolean) => void
  /** The caret's id, which names the menu. */
  triggerId: string
  /** Generated id the caret uses unless it is given its own. */
  defaultTriggerId: string
  /** The caret reports the id its element carries here (`null` when it is the default). */
  registerTriggerId: (id: string | null) => void
  /** The caret element, so the menu can read its writing direction. */
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>
}

const SplitButtonContext = React.createContext<SplitButtonContextValue | null>(null)

function useSplitButtonContext(component: string): SplitButtonContextValue {
  const ctx = React.useContext(SplitButtonContext)
  if (!ctx) {
    devWarn(
      'react-split-button/context-outside-provider',
      `${component} must be rendered inside a <SplitButton>. The missing SplitButtonContext makes this throw.`,
    )
    throw new Error(`${component} must be used within <SplitButton>`)
  }
  return ctx
}

// ---------------------------------------------------------------------------
// SplitButton (root)
// ---------------------------------------------------------------------------

export interface SplitButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Button variant, shared by both parts. */
  variant?: ButtonVariant
  /** Button size, shared by both parts; the caret is a square of the same height. */
  size?: ButtonSize
  /** Disables both parts and closes the menu. */
  disabled?: boolean
  /** Controlled menu state. */
  open?: boolean
  /** Initial menu state when uncontrolled. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Minimum hit area of each part in CSS pixels; extends past the visual box without moving layout. */
  minTapTarget?: number
}

/**
 * SplitButton — a primary action fused with a caret that opens a menu of
 * secondary actions.
 *
 * Both parts are real buttons with their own accessible names, inside a
 * `role="group"`. The caret is DropdownMenu's trigger and `SplitButtonMenu` is
 * its content, so the menu keeps DropdownMenu's keyboard model: Escape closes
 * it and returns focus to the caret, arrow keys move between items. The caret
 * adds ArrowDown-to-open. Both parts take Button's variants and sizes.
 */
export const SplitButton = React.forwardRef<HTMLDivElement, SplitButtonProps>(function SplitButton(
  {
    variant,
    size,
    disabled = false,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    minTapTarget,
    className,
    children,
    ...props
  },
  ref,
) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  // React IDs agree across SSR and hydration.
  const defaultTriggerId = `rfr-split-button-${React.useId()}-trigger`
  const [registeredTriggerId, registerTriggerId] = React.useState<string | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  const api = createSplitButton({ variant, size, disabled, open, minTapTarget })

  const ctx: SplitButtonContextValue = {
    api,
    disabled,
    open,
    setOpen,
    triggerId: registeredTriggerId ?? defaultTriggerId,
    defaultTriggerId,
    registerTriggerId,
    triggerRef,
  }

  return (
    <SplitButtonContext.Provider value={ctx}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <div
          ref={ref}
          className={cn(splitButtonGroupClass, className)}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        >
          {children}
        </div>
      </DropdownMenu>
    </SplitButtonContext.Provider>
  )
})

// ---------------------------------------------------------------------------
// SplitButtonAction
// ---------------------------------------------------------------------------

/** Button props; `variant` and `size` come from the enclosing SplitButton. */
export type SplitButtonActionProps = Omit<ButtonProps, 'variant' | 'size' | 'asChild'>

/** The primary action: a `Button` sharing the group's variant and size. */
export const SplitButtonAction = React.forwardRef<HTMLButtonElement, SplitButtonActionProps>(
  function SplitButtonAction({ disabled, className, children, ...props }, ref) {
    const ctx = useSplitButtonContext('SplitButtonAction')
    return (
      <Button
        ref={ref}
        variant={ctx.api.variant}
        size={ctx.api.size}
        disabled={isSplitButtonPartDisabled(ctx.disabled, disabled)}
        className={cn(splitButtonActionClass, className)}
        {...props}
      >
        <span
          aria-hidden="true"
          data-split-button-hit-area=""
          className={splitButtonHitAreaVariants({ part: 'action' })}
          style={ctx.api.hitAreaStyle}
        />
        {children}
      </Button>
    )
  },
)

// ---------------------------------------------------------------------------
// SplitButtonTrigger
// ---------------------------------------------------------------------------

export interface SplitButtonTriggerProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    // `label` owns the accessible name, and the caret must never submit a form.
    'aria-label' | 'type'
  > {
  /** Accessible name of the caret. Defaults to "More options". */
  label?: string
}

function CaretGlyph() {
  return (
    <svg
      aria-hidden="true"
      className={splitButtonCaretClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/**
 * The caret: DropdownMenu's trigger, styled as the group's Button. Children
 * replace the default chevron glyph.
 */
export const SplitButtonTrigger = React.forwardRef<HTMLButtonElement, SplitButtonTriggerProps>(
  function SplitButtonTrigger({ label, disabled, id, className, onKeyDown, children, ...props }, forwardedRef) {
    const ctx = useSplitButtonContext('SplitButtonTrigger')
    const { open, setOpen, defaultTriggerId, registerTriggerId, triggerRef } = ctx
    const isDisabled = isSplitButtonPartDisabled(ctx.disabled, disabled)
    const trigger = createSplitButtonTrigger({ label, open, disabled: isDisabled })

    // Report the id the caret element actually carries, so the menu is named
    // by it. It differs from the default when the caller supplies one, and
    // when a server-rendered id survives hydration under a different client
    // useId: React keeps the server's attributes, and react-dom before 19.3
    // computes other ids after replaying a lazy ancestor that suspended
    // during hydration. In the common case it matches, and nothing re-renders.
    useIsomorphicLayoutEffect(() => {
      const renderedId = triggerRef.current?.id
      registerTriggerId(renderedId && renderedId !== defaultTriggerId ? renderedId : null)
    }, [registerTriggerId, triggerRef, defaultTriggerId, id])

    // A disabled caret can no longer close its menu, so close it now.
    useIsomorphicLayoutEffect(() => {
      if (isDisabled && open) setOpen(false)
    }, [isDisabled, open, setOpen])

    const setRefs = React.useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [triggerRef, forwardedRef],
    )

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented) return
      if (getSplitButtonTriggerKeyIntent({ key: event.key, open, disabled: isDisabled }) === 'open') {
        // Keep the page from scrolling; DropdownMenu focuses the first item.
        event.preventDefault()
        setOpen(true)
      }
    }

    return (
      <DropdownMenuTrigger
        ref={setRefs}
        id={id ?? defaultTriggerId}
        disabled={isDisabled}
        className={cn(
          buttonVariants({ variant: ctx.api.variant, size: ctx.api.size }),
          splitButtonTriggerVariants({ divider: ctx.api.divider }),
          className,
        )}
        {...trigger.ariaProps}
        {...trigger.dataAttributes}
        {...props}
        onKeyDown={handleKeyDown}
      >
        <span
          aria-hidden="true"
          data-split-button-hit-area=""
          className={splitButtonHitAreaVariants({ part: 'trigger' })}
          style={ctx.api.hitAreaStyle}
        />
        {children ?? <CaretGlyph />}
      </DropdownMenuTrigger>
    )
  },
)

// ---------------------------------------------------------------------------
// SplitButtonMenu
// ---------------------------------------------------------------------------

export interface SplitButtonMenuProps extends Omit<DropdownMenuContentProps, 'align'> {
  /**
   * Logical alignment to the caret. `end` (the default) lines the menu's end
   * edge up with the caret's, so it opens under the control in both writing
   * directions.
   */
  align?: SplitButtonMenuAlign
}

/**
 * The menu of secondary actions: DropdownMenu's content, named by the caret.
 * Fill it with `DropdownMenuItem`, `DropdownMenuSeparator` and
 * `DropdownMenuLabel`.
 */
export const SplitButtonMenu = React.forwardRef<HTMLDivElement, SplitButtonMenuProps>(
  function SplitButtonMenu({ align = SPLIT_BUTTON_DEFAULT_MENU_ALIGN, ...props }, ref) {
    const { open, triggerId, triggerRef } = useSplitButtonContext('SplitButtonMenu')
    const [direction, setDirection] = React.useState<SplitButtonDirection>('ltr')

    // DropdownMenu aligns by physical edge; read the caret's direction when
    // the menu opens so `align` stays logical. Runs before paint, so an RTL
    // menu never flashes at its LTR position.
    useIsomorphicLayoutEffect(() => {
      if (!open || !triggerRef.current) return
      setDirection(resolveSplitButtonDirection(getComputedStyle(triggerRef.current).direction))
    }, [open, triggerRef])

    return (
      <DropdownMenuContent
        ref={ref}
        align={resolveSplitButtonMenuAlign(align, direction)}
        aria-labelledby={triggerId}
        {...props}
      />
    )
  },
)
