import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  CONTEXT_MENU_COLLISION_PADDING_PX,
  CONTEXT_MENU_ITEM_ROLES,
  CONTEXT_MENU_LONG_PRESS_DELAY_MS,
  CONTEXT_MENU_TYPEAHEAD_INITIAL,
  CONTEXT_SUBMENU_CLOSE_DELAY_MS,
  CONTEXT_SUBMENU_OPEN_DELAY_MS,
  appendContextMenuTypeahead,
  computeContextMenuPosition,
  computeContextSubmenuPosition,
  contextMenuContentVariants,
  contextMenuIndicatorClass,
  contextMenuItemVariants,
  contextMenuLabelVariants,
  contextMenuSeparatorClass,
  contextMenuShortcutClass,
  contextMenuSubChevronClass,
  contextMenuSubTriggerClass,
  contextMenuTriggerClass,
  exceedsContextMenuLongPressTolerance,
  findContextMenuTypeaheadIndex,
  getContextMenuElementAnchor,
  getContextMenuItemAria,
  getNextContextMenuIndex,
  isContextMenuLongPressPointer,
  isContextMenuOpenKey,
  isContextMenuTypeaheadKey,
  isContextSubmenuCloseKey,
  isContextSubmenuOpenKey,
  type ContextMenuCheckboxItemProps as CoreCheckboxItemProps,
  type ContextMenuItemProps as CoreItemProps,
  type ContextMenuPlacement,
  type ContextMenuPoint,
  type ContextMenuRadioItemProps as CoreRadioItemProps,
  type ContextMenuSize,
  type ContextMenuTypeaheadState,
} from '@refraction-ui/context-menu'
import { FOCUSABLE_SELECTOR, cn, devWarn } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// Shared internals
// ---------------------------------------------------------------------------

/** Every menu surface of one ContextMenu carries this attribute, so an outside click can be told apart from a click in any of its (portalled) submenus. */
const MENU_GROUP_ATTR = 'data-rfr-context-menu'
const ITEM_SELECTOR = CONTEXT_MENU_ITEM_ROLES.map((role) => `[role="${role}"]`).join(',')
const NO_SCROLL: FocusOptions = { preventScroll: true }

type OpenOrigin = 'pointer' | 'keyboard'
type InitialFocus = 'first' | 'menu' | 'none'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

function composeHandlers<E extends React.SyntheticEvent>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void,
): (event: E) => void {
  return (event) => {
    theirs?.(event)
    if (!event.defaultPrevented) ours(event)
  }
}

function viewportSize(): ContextMenuSize {
  return { width: window.innerWidth, height: window.innerHeight }
}

function isDisabledItem(el: Element): boolean {
  return el.getAttribute('aria-disabled') === 'true'
}

/** Rows that belong to this menu level, not to a nested submenu. */
function menuItems(menu: HTMLElement): HTMLElement[] {
  return Array.from(menu.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    (el) => el.closest('[role="menu"]') === menu,
  )
}

function itemLabel(el: HTMLElement): string {
  return el.dataset.textValue ?? el.textContent ?? ''
}

function focusFirstItem(menu: HTMLElement | null): void {
  if (!menu) return
  const first = menuItems(menu).find((el) => !isDisabledItem(el))
  first?.focus(NO_SCROLL)
}

/** The focusable element under the pointer inside the trigger, else the trigger itself. */
function pointerReturnTarget(target: EventTarget, trigger: HTMLElement): HTMLElement {
  const focusable = target instanceof Element ? target.closest<HTMLElement>(FOCUSABLE_SELECTOR) : null
  return focusable && trigger.contains(focusable) ? focusable : trigger
}

/**
 * After a long-press opens the menu, the lifted finger can still produce a
 * click on whatever is now under it (the menu's first row). Swallow that one
 * click; the next pointerdown starts a new gesture and disarms the guard.
 */
function armLongPressClickGuard(doc: Document): () => void {
  const swallow = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    disarm()
  }
  const disarm = () => {
    doc.removeEventListener('click', swallow, true)
    doc.removeEventListener('pointerdown', disarm, true)
  }
  doc.addEventListener('click', swallow, true)
  doc.addEventListener('pointerdown', disarm, true)
  return disarm
}

function ChevronRightIcon() {
  return (
    <svg className={contextMenuSubChevronClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function DotIcon() {
  return (
    <svg className="size-2" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
      <circle cx="4" cy="4" r="4" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Root context
// ---------------------------------------------------------------------------

interface ContextMenuContextValue {
  open: boolean
  point: ContextMenuPoint
  origin: OpenOrigin
  contentId: string
  groupId: string
  openAt(point: ContextMenuPoint, origin: OpenOrigin, returnFocus: HTMLElement | null): void
  close(): void
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null)

function useContextMenuContext(part: string): ContextMenuContextValue {
  const ctx = React.useContext(ContextMenuContext)
  if (!ctx) {
    devWarn(
      'react-context-menu/context-outside-provider',
      `${part} must be rendered inside a <ContextMenu>. The missing ContextMenuContext makes this throw.`,
    )
    throw new Error(`${part} must be used within <ContextMenu>`)
  }
  return ctx
}

// ---------------------------------------------------------------------------
// ContextMenu (root provider)
// ---------------------------------------------------------------------------

export interface ContextMenuProps {
  /** Whether the menu is open (controlled). */
  open?: boolean
  /** Whether the menu starts open (uncontrolled). */
  defaultOpen?: boolean
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

/**
 * ContextMenu — a menu opened at the pointer (right-click, long-press) or at
 * the focused element (Shift+F10, the ContextMenu key), with submenus, roving
 * focus and typeahead. Rows share DropdownMenu's shape (`disabled`,
 * `onSelect`) so one menu definition renders in either.
 */
export function ContextMenu({ open: controlledOpen, defaultOpen = false, onOpenChange, children }: ContextMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const [point, setPoint] = React.useState<ContextMenuPoint>({ x: 0, y: 0 })
  const [origin, setOrigin] = React.useState<OpenOrigin>('pointer')
  const returnFocusRef = React.useRef<HTMLElement | null>(null)
  const reactId = React.useId()
  const contentId = `rfr-context-menu-${reactId}`

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  const openAt = React.useCallback(
    (nextPoint: ContextMenuPoint, nextOrigin: OpenOrigin, returnFocus: HTMLElement | null) => {
      setPoint(nextPoint)
      setOrigin(nextOrigin)
      returnFocusRef.current = returnFocus
      if (!open) setOpen(true)
    },
    [open, setOpen],
  )

  const close = React.useCallback(() => {
    setOpen(false)
    returnFocusRef.current?.focus(NO_SCROLL)
  }, [setOpen])

  const ctx = React.useMemo<ContextMenuContextValue>(
    () => ({ open, point, origin, contentId, groupId: reactId, openAt, close }),
    [open, point, origin, contentId, reactId, openAt, close],
  )

  return <ContextMenuContext.Provider value={ctx}>{children}</ContextMenuContext.Provider>
}

// ---------------------------------------------------------------------------
// ContextMenuTrigger
// ---------------------------------------------------------------------------

export interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Merge the trigger behaviour onto the single child element instead of wrapping it in a `<div>`. */
  asChild?: boolean
  /** Let the browser's native context menu through instead. */
  disabled?: boolean
  /** Milliseconds a touch or pen must rest before the menu opens. Defaults to `CONTEXT_MENU_LONG_PRESS_DELAY_MS` (500). */
  longPressDelay?: number
}

interface LongPress {
  start: ContextMenuPoint
  timer: ReturnType<typeof setTimeout>
}

export const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  function ContextMenuTrigger(
    {
      asChild = false,
      disabled = false,
      longPressDelay = CONTEXT_MENU_LONG_PRESS_DELAY_MS,
      className,
      children,
      onContextMenu,
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      ...props
    },
    ref,
  ) {
    const { open, origin, openAt } = useContextMenuContext('ContextMenuTrigger')
    const longPressRef = React.useRef<LongPress | null>(null)
    const disarmGuardRef = React.useRef<(() => void) | null>(null)

    const cancelLongPress = React.useCallback(() => {
      if (longPressRef.current) clearTimeout(longPressRef.current.timer)
      longPressRef.current = null
    }, [])

    React.useEffect(
      () => () => {
        cancelLongPress()
        disarmGuardRef.current?.()
      },
      [cancelLongPress],
    )

    const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) return
      event.preventDefault()
      // A keyboard open can be followed by the browser's own contextmenu event; keep the keyboard anchor.
      if (open && origin === 'keyboard') return
      cancelLongPress()
      openAt({ x: event.clientX, y: event.clientY }, 'pointer', pointerReturnTarget(event.target, event.currentTarget))
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      if (disabled || !isContextMenuOpenKey(event)) return
      event.preventDefault()
      const focused = event.target as HTMLElement
      openAt(getContextMenuElementAnchor(focused.getBoundingClientRect()), 'keyboard', focused)
    }

    const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
      if (disabled || !isContextMenuLongPressPointer(event.pointerType)) return
      cancelLongPress()
      const start = { x: event.clientX, y: event.clientY }
      const returnFocus = pointerReturnTarget(event.target, event.currentTarget)
      const doc = event.currentTarget.ownerDocument
      const timer = setTimeout(() => {
        longPressRef.current = null
        disarmGuardRef.current?.()
        disarmGuardRef.current = armLongPressClickGuard(doc)
        openAt(start, 'pointer', returnFocus)
      }, longPressDelay)
      longPressRef.current = { start, timer }
    }

    const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
      const press = longPressRef.current
      if (!press) return
      if (exceedsContextMenuLongPressTolerance(press.start, { x: event.clientX, y: event.clientY })) cancelLongPress()
    }

    const triggerProps = {
      'data-state': open ? 'open' : 'closed',
      'data-disabled': disabled ? '' : undefined,
      onContextMenu: composeHandlers(onContextMenu, handleContextMenu),
      onKeyDown: composeHandlers(onKeyDown, handleKeyDown),
      onPointerDown: composeHandlers(onPointerDown, handlePointerDown),
      onPointerMove: composeHandlers(onPointerMove, handlePointerMove),
      onPointerUp: composeHandlers(onPointerUp, cancelLongPress),
      onPointerCancel: composeHandlers(onPointerCancel, cancelLongPress),
    }

    if (asChild) {
      if (!React.isValidElement(children)) {
        devWarn(
          'react-context-menu/trigger-asChild-child',
          'ContextMenuTrigger: `asChild` expects a single React element child; rendering nothing.',
        )
        return null
      }
      const child = children as React.ReactElement<Record<string, unknown>>
      const childProps = child.props
      const merged: Record<string, unknown> = {
        ...props,
        ...triggerProps,
        className: cn(contextMenuTriggerClass, childProps.className as string | undefined, className),
      }
      // Run the child's own handlers first, like a composed prop would.
      for (const name of Object.keys(triggerProps)) {
        const ours = merged[name]
        const theirs = childProps[name]
        if (typeof ours === 'function' && typeof theirs === 'function') {
          merged[name] = composeHandlers(theirs as (e: React.SyntheticEvent) => void, ours as (e: React.SyntheticEvent) => void)
        }
      }
      return React.cloneElement(child, merged)
    }

    return (
      <div ref={ref} className={cn(contextMenuTriggerClass, className)} {...props} {...triggerProps}>
        {children}
      </div>
    )
  },
)

// ---------------------------------------------------------------------------
// Menu panel (shared by root content and submenu content)
// ---------------------------------------------------------------------------

interface MenuLevelContextValue {
  /** Tell open submenus at this level that keyboard focus moved to `el`. */
  notifyFocusMove(el: HTMLElement): void
  subscribe(listener: (el: HTMLElement) => void): () => void
}

const MenuLevelContext = React.createContext<MenuLevelContextValue | null>(null)

interface MenuPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  initialFocus: InitialFocus
  place(menu: ContextMenuSize, viewport: ContextMenuSize): ContextMenuPlacement
  /** Handles ArrowLeft in a submenu; root menus pass nothing. */
  onCloseLevel?: () => void
}

const MenuPanel = React.forwardRef<HTMLDivElement, MenuPanelProps>(function MenuPanel(
  { id, initialFocus, place, onCloseLevel, className, style, children, onKeyDown, onContextMenu, ...props },
  forwardedRef,
) {
  const root = useContextMenuContext('ContextMenuContent')
  const menuRef = React.useRef<HTMLDivElement | null>(null)
  const [placement, setPlacement] = React.useState<ContextMenuPlacement | null>(null)
  const typeaheadRef = React.useRef<ContextMenuTypeaheadState>(CONTEXT_MENU_TYPEAHEAD_INITIAL)
  const listenersRef = React.useRef(new Set<(el: HTMLElement) => void>())

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      menuRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef],
  )

  // Measure, then flip / shift into the viewport before the browser paints.
  useIsomorphicLayoutEffect(() => {
    const update = () => {
      const menu = menuRef.current
      if (!menu) return
      setPlacement(place({ width: menu.offsetWidth, height: menu.offsetHeight }, viewportSize()))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [place])

  React.useEffect(() => {
    if (initialFocus === 'first') focusFirstItem(menuRef.current)
    else if (initialFocus === 'menu') menuRef.current?.focus(NO_SCROLL)
    // Only on mount (the root re-keys per open): later re-renders must not steal focus back.
  }, [])

  const level = React.useMemo<MenuLevelContextValue>(
    () => ({
      notifyFocusMove: (el) => listenersRef.current.forEach((listener) => listener(el)),
      subscribe: (listener) => {
        listenersRef.current.add(listener)
        return () => listenersRef.current.delete(listener)
      },
    }),
    [],
  )

  const moveFocus = (items: HTMLElement[], index: number) => {
    const target = items[index]
    if (!target) return
    target.focus(NO_SCROLL)
    level.notifyFocusMove(target)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const menu = menuRef.current
    // Keys from a portalled submenu bubble through React; only handle our own level.
    if (!menu || (event.target as Element).closest('[role="menu"]') !== menu) return
    if (event.key === 'Escape') {
      event.preventDefault()
      root.close()
      return
    }
    if (event.key === 'Tab') {
      // Let Tab continue from the target, as if the menu had never opened.
      root.close()
      return
    }
    if (onCloseLevel && isContextSubmenuCloseKey(event.key)) {
      event.preventDefault()
      onCloseLevel()
      return
    }
    const items = menuItems(menu)
    const current = items.indexOf(document.activeElement as HTMLElement)
    if (isContextMenuTypeaheadKey(event)) {
      typeaheadRef.current = appendContextMenuTypeahead(typeaheadRef.current, event.key, event.timeStamp)
      const labels = items.map((el) => ({ label: itemLabel(el), disabled: isDisabledItem(el) }))
      moveFocus(items, findContextMenuTypeaheadIndex(labels, typeaheadRef.current.query, current))
      return
    }
    const next = getNextContextMenuIndex(items.map(isDisabledItem), current, event.key)
    if (next === current) return
    event.preventDefault()
    moveFocus(items, next)
  }

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    // Never stack the native menu on top of ours.
    event.preventDefault()
  }

  const positionStyle: React.CSSProperties = placement
    ? { position: 'fixed', left: placement.x, top: placement.y, maxHeight: placement.maxHeight }
    : { position: 'fixed', left: root.point.x, top: root.point.y }

  const panel = (
    <div
      ref={setRefs}
      role="menu"
      id={id}
      tabIndex={-1}
      aria-orientation="vertical"
      data-state="open"
      data-flipped-x={placement?.flippedX ? '' : undefined}
      data-flipped-y={placement?.flippedY ? '' : undefined}
      {...{ [MENU_GROUP_ATTR]: root.groupId }}
      className={cn(contextMenuContentVariants(), className)}
      style={{ ...positionStyle, ...style }}
      onKeyDown={composeHandlers(onKeyDown, handleKeyDown)}
      onContextMenu={composeHandlers(onContextMenu, handleContextMenu)}
      {...props}
    >
      <MenuLevelContext.Provider value={level}>{children}</MenuLevelContext.Provider>
    </div>
  )

  if (typeof document === 'undefined') return panel
  return ReactDOM.createPortal(panel, document.body)
})

// ---------------------------------------------------------------------------
// ContextMenuContent
// ---------------------------------------------------------------------------

export interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Minimum gap in px kept between the menu and the viewport edge. Defaults to 8. */
  collisionPadding?: number
}

export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  function ContextMenuContent({ collisionPadding = CONTEXT_MENU_COLLISION_PADDING_PX, ...props }, ref) {
    const root = useContextMenuContext('ContextMenuContent')
    const { open, point, origin, contentId, groupId, close } = root

    const place = React.useCallback(
      (menu: ContextMenuSize, viewport: ContextMenuSize) =>
        computeContextMenuPosition(point, menu, viewport, { padding: collisionPadding }),
      [point, collisionPadding],
    )

    // Close on a press outside this menu and all of its submenus.
    React.useEffect(() => {
      if (!open) return
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target
        if (target instanceof Element && target.closest(`[${MENU_GROUP_ATTR}="${groupId}"]`)) return
        close()
      }
      document.addEventListener('pointerdown', onPointerDown, true)
      return () => document.removeEventListener('pointerdown', onPointerDown, true)
    }, [open, groupId, close])

    if (!open) return null
    return (
      <MenuPanel
        // Re-mount on each open so a new point re-measures and re-focuses.
        key={`${point.x},${point.y},${origin}`}
        ref={ref}
        id={contentId}
        initialFocus={origin === 'keyboard' ? 'first' : 'menu'}
        place={place}
        {...props}
      />
    )
  },
)

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

interface ActivationOptions {
  disabled: boolean
  onActivate: () => void
}

/** Click / Enter / Space activation, plus hover focus, shared by every row kind. */
function useItemActivation({ disabled, onActivate }: ActivationOptions) {
  return {
    onClick: (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      if (!disabled) onActivate()
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      if (!disabled) onActivate()
    },
    // Hover moves focus but does not notify the level: a pointer crossing
    // sibling rows on its way into an open submenu must not collapse it.
    onPointerEnter: (event: React.PointerEvent<HTMLDivElement>) => {
      if (!disabled) event.currentTarget.focus(NO_SCROLL)
    },
  }
}

type ItemDomProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>

function mergeActivation(
  props: ItemDomProps,
  activation: ReturnType<typeof useItemActivation>,
): Pick<ItemDomProps, 'onClick' | 'onKeyDown' | 'onPointerEnter'> {
  return {
    onClick: composeHandlers(props.onClick, activation.onClick),
    onKeyDown: composeHandlers(props.onKeyDown, activation.onKeyDown),
    onPointerEnter: composeHandlers(props.onPointerEnter, activation.onPointerEnter),
  }
}

export interface ContextMenuItemProps extends ItemDomProps, CoreItemProps {}

export const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(function ContextMenuItem(
  { disabled = false, onSelect, variant = 'default', inset = false, textValue, className, children, ...props },
  ref,
) {
  const { close } = useContextMenuContext('ContextMenuItem')
  const activation = useItemActivation({
    disabled,
    onActivate: () => {
      onSelect?.()
      close()
    },
  })
  return (
    <div
      ref={ref}
      {...getContextMenuItemAria({ kind: 'item', disabled })}
      data-variant={variant}
      data-text-value={textValue}
      className={cn(contextMenuItemVariants({ variant, inset: inset ? 'true' : 'false' }), className)}
      {...props}
      {...mergeActivation(props, activation)}
    >
      {children}
    </div>
  )
})

export interface ContextMenuCheckboxItemProps extends ItemDomProps, CoreCheckboxItemProps {}

export const ContextMenuCheckboxItem = React.forwardRef<HTMLDivElement, ContextMenuCheckboxItemProps>(
  function ContextMenuCheckboxItem(
    { checked = false, onCheckedChange, disabled = false, onSelect, textValue, className, children, ...props },
    ref,
  ) {
    const { close } = useContextMenuContext('ContextMenuCheckboxItem')
    const activation = useItemActivation({
      disabled,
      onActivate: () => {
        onCheckedChange?.(!checked)
        onSelect?.()
        close()
      },
    })
    return (
      <div
        ref={ref}
        {...getContextMenuItemAria({ kind: 'checkbox', disabled, checked })}
        data-text-value={textValue}
        className={cn(contextMenuItemVariants({ inset: 'true' }), className)}
        {...props}
        {...mergeActivation(props, activation)}
      >
        <span className={contextMenuIndicatorClass}>{checked ? <CheckIcon /> : null}</span>
        {children}
      </div>
    )
  },
)

interface RadioGroupContextValue {
  value?: string
  onValueChange?: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({})

export interface ContextMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The selected item's value (controlled). */
  value?: string
  /** Called with the value of the radio item the user picks. */
  onValueChange?: (value: string) => void
}

export const ContextMenuRadioGroup = React.forwardRef<HTMLDivElement, ContextMenuRadioGroupProps>(
  function ContextMenuRadioGroup({ value, onValueChange, children, ...props }, ref) {
    const ctx = React.useMemo(() => ({ value, onValueChange }), [value, onValueChange])
    return (
      <div ref={ref} role="group" {...props}>
        <RadioGroupContext.Provider value={ctx}>{children}</RadioGroupContext.Provider>
      </div>
    )
  },
)

export interface ContextMenuRadioItemProps extends ItemDomProps, CoreRadioItemProps {}

export const ContextMenuRadioItem = React.forwardRef<HTMLDivElement, ContextMenuRadioItemProps>(
  function ContextMenuRadioItem({ value, disabled = false, onSelect, textValue, className, children, ...props }, ref) {
    const { close } = useContextMenuContext('ContextMenuRadioItem')
    const group = React.useContext(RadioGroupContext)
    const checked = group.value === value
    const activation = useItemActivation({
      disabled,
      onActivate: () => {
        group.onValueChange?.(value)
        onSelect?.()
        close()
      },
    })
    return (
      <div
        ref={ref}
        {...getContextMenuItemAria({ kind: 'radio', disabled, checked })}
        data-text-value={textValue}
        className={cn(contextMenuItemVariants({ inset: 'true' }), className)}
        {...props}
        {...mergeActivation(props, activation)}
      >
        <span className={contextMenuIndicatorClass}>{checked ? <DotIcon /> : null}</span>
        {children}
      </div>
    )
  },
)

// ---------------------------------------------------------------------------
// Static parts
// ---------------------------------------------------------------------------

export interface ContextMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ContextMenuGroup = React.forwardRef<HTMLDivElement, ContextMenuGroupProps>(function ContextMenuGroup(props, ref) {
  return <div ref={ref} role="group" {...props} />
})

export interface ContextMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Indent to line up with checkable rows. */
  inset?: boolean
}

export const ContextMenuLabel = React.forwardRef<HTMLDivElement, ContextMenuLabelProps>(function ContextMenuLabel(
  { inset = false, className, ...props },
  ref,
) {
  return <div ref={ref} className={cn(contextMenuLabelVariants({ inset: inset ? 'true' : 'false' }), className)} {...props} />
})

export interface ContextMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ContextMenuSeparator = React.forwardRef<HTMLDivElement, ContextMenuSeparatorProps>(
  function ContextMenuSeparator({ className, ...props }, ref) {
    return <div ref={ref} role="separator" aria-orientation="horizontal" className={cn(contextMenuSeparatorClass, className)} {...props} />
  },
)

export interface ContextMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const ContextMenuShortcut = React.forwardRef<HTMLSpanElement, ContextMenuShortcutProps>(
  function ContextMenuShortcut({ className, ...props }, ref) {
    return <span ref={ref} className={cn(contextMenuShortcutClass, className)} {...props} />
  },
)

// ---------------------------------------------------------------------------
// Submenus
// ---------------------------------------------------------------------------

interface SubContextValue {
  open: boolean
  contentId: string
  triggerRef: React.MutableRefObject<HTMLDivElement | null>
  contentRef: React.MutableRefObject<HTMLDivElement | null>
  /** Set when the submenu was opened from the keyboard, so it focuses its first row. */
  focusFirstRef: React.MutableRefObject<boolean>
  setOpen(open: boolean): void
  scheduleOpen(): void
  scheduleClose(): void
  cancelTimer(): void
}

const SubContext = React.createContext<SubContextValue | null>(null)

function useSubContext(part: string): SubContextValue {
  const ctx = React.useContext(SubContext)
  if (!ctx) throw new Error(`${part} must be used within <ContextMenuSub>`)
  return ctx
}

export interface ContextMenuSubProps {
  /** Whether the submenu is open (controlled). */
  open?: boolean
  /** Whether the submenu starts open (uncontrolled). */
  defaultOpen?: boolean
  /** Called when the submenu opens or closes. */
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function ContextMenuSub({ open: controlledOpen, defaultOpen = false, onOpenChange, children }: ContextMenuSubProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const contentId = `rfr-context-submenu-${React.useId()}`
  const triggerRef = React.useRef<HTMLDivElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const focusFirstRef = React.useRef(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const level = React.useContext(MenuLevelContext)

  const cancelTimer = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const setOpen = React.useCallback(
    (next: boolean) => {
      cancelTimer()
      if (next === open) return
      // Closing while focus is inside the submenu would drop focus to <body>.
      if (!next && contentRef.current?.contains(document.activeElement)) triggerRef.current?.focus(NO_SCROLL)
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [open, isControlled, onOpenChange, cancelTimer],
  )

  const schedule = React.useCallback(
    (next: boolean, delay: number) => {
      cancelTimer()
      timerRef.current = setTimeout(() => setOpen(next), delay)
    },
    [cancelTimer, setOpen],
  )

  React.useEffect(() => cancelTimer, [cancelTimer])

  // Runs after the submenu's panel has committed, so its rows exist to focus.
  React.useEffect(() => {
    if (!open || !focusFirstRef.current) return
    focusFirstRef.current = false
    focusFirstItem(contentRef.current)
  }, [open])

  // Keyboard focus moving to a sibling row closes this submenu.
  React.useEffect(() => {
    if (!level || !open) return
    return level.subscribe((el) => {
      if (el !== triggerRef.current) setOpen(false)
    })
  }, [level, open, setOpen])

  const ctx = React.useMemo<SubContextValue>(
    () => ({
      open,
      contentId,
      triggerRef,
      contentRef,
      focusFirstRef,
      setOpen,
      scheduleOpen: () => schedule(true, CONTEXT_SUBMENU_OPEN_DELAY_MS),
      scheduleClose: () => schedule(false, CONTEXT_SUBMENU_CLOSE_DELAY_MS),
      cancelTimer,
    }),
    [open, contentId, setOpen, schedule, cancelTimer],
  )

  return <SubContext.Provider value={ctx}>{children}</SubContext.Provider>
}

export interface ContextMenuSubTriggerProps extends ItemDomProps {
  /** Whether the sub-trigger is disabled. */
  disabled?: boolean
  /** Indent to line up with checkable rows. */
  inset?: boolean
  /** Text used for typeahead when the children are not plain text. */
  textValue?: string
}

export const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(
  function ContextMenuSubTrigger(
    { disabled = false, inset = false, textValue, className, children, onClick, onKeyDown, onPointerEnter, onPointerLeave, ...props },
    forwardedRef,
  ) {
    const sub = useSubContext('ContextMenuSubTrigger')
    const setRefs = (node: HTMLDivElement | null) => {
      sub.triggerRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      if (!disabled) sub.setOpen(true)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled || !isContextSubmenuOpenKey(event.key)) return
      event.preventDefault()
      if (sub.open) {
        focusFirstItem(sub.contentRef.current)
        return
      }
      sub.focusFirstRef.current = true
      sub.setOpen(true)
    }

    const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      event.currentTarget.focus(NO_SCROLL)
      if (sub.open) sub.cancelTimer()
      else sub.scheduleOpen()
    }

    const handlePointerLeave = () => {
      if (!disabled) sub.scheduleClose()
    }

    return (
      <div
        ref={setRefs}
        {...getContextMenuItemAria({ kind: 'subtrigger', disabled, expanded: sub.open, controls: sub.open ? sub.contentId : undefined })}
        data-text-value={textValue}
        className={cn(contextMenuItemVariants({ inset: inset ? 'true' : 'false' }), contextMenuSubTriggerClass, className)}
        onClick={composeHandlers(onClick, handleClick)}
        onKeyDown={composeHandlers(onKeyDown, handleKeyDown)}
        onPointerEnter={composeHandlers(onPointerEnter, handlePointerEnter)}
        onPointerLeave={composeHandlers(onPointerLeave, handlePointerLeave)}
        {...props}
      >
        {children}
        <ChevronRightIcon />
      </div>
    )
  },
)

export interface ContextMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Minimum gap in px kept between the submenu and the viewport edge. Defaults to 8. */
  collisionPadding?: number
}

export const ContextMenuSubContent = React.forwardRef<HTMLDivElement, ContextMenuSubContentProps>(
  function ContextMenuSubContent(
    { collisionPadding = CONTEXT_MENU_COLLISION_PADDING_PX, onPointerEnter, onPointerLeave, ...props },
    forwardedRef,
  ) {
    const root = useContextMenuContext('ContextMenuSubContent')
    const sub = useSubContext('ContextMenuSubContent')
    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        sub.contentRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [sub.contentRef, forwardedRef],
    )

    const { triggerRef } = sub
    const place = React.useCallback(
      (menu: ContextMenuSize, viewport: ContextMenuSize) => {
        const rect = triggerRef.current?.getBoundingClientRect() ?? { top: 0, right: 0, bottom: 0, left: 0 }
        return computeContextSubmenuPosition(rect, menu, viewport, { padding: collisionPadding })
      },
      [triggerRef, collisionPadding],
    )

    if (!root.open || !sub.open) return null
    return (
      <MenuPanel
        ref={setRefs}
        id={sub.contentId}
        // Keyboard opening focuses the first row from ContextMenuSub; hover leaves focus on the trigger.
        initialFocus="none"
        place={place}
        onCloseLevel={() => sub.setOpen(false)}
        onPointerEnter={composeHandlers(onPointerEnter, sub.cancelTimer)}
        onPointerLeave={composeHandlers(onPointerLeave, sub.scheduleClose)}
        {...props}
      />
    )
  },
)
