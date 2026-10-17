import * as React from 'react'
import {
  createNavItem,
  resolveNavItemIcon,
  getNavItemTooltipPosition,
  navItemVariants,
  navItemIndicatorClass,
  navItemIconClass,
  navItemLabelClass,
  navItemTrailingClass,
  navItemCountVariants,
  navItemLiveDotVariants,
  navItemTooltipClass,
  navItemTooltipTriggerVariants,
  type NavItemCountLabelFormatter,
} from '@refraction-ui/nav-item'
import { Slot } from '@refraction-ui/react-slot'
import { Tooltip, TooltipTrigger, TooltipContent } from '@refraction-ui/react-tooltip'
import { cn } from '@refraction-ui/shared'

export type { NavItemCountLabelFormatter }

/** A rail sits on the leading edge, so its tooltips open towards the content. */
const COLLAPSED_TOOLTIP_SIDE = 'right'

export interface NavItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Visible label; the tooltip and accessible name when `collapsed`. */
  label: string
  /** Icon shown before the label (or alone when collapsed). */
  icon?: React.ReactNode
  /** Icon shown instead of `icon` while `selected`. */
  activeIcon?: React.ReactNode
  /** Number waiting at this destination; 0 or less hides the badge. */
  count?: number
  /** Cap for the visible count; above it the badge reads "99+". Default 99. */
  maxCount?: number
  /** The current destination: sets `aria-current="page"`. */
  selected?: boolean
  /** Icon-only rail presentation: count on the icon corner, label as tooltip. */
  collapsed?: boolean
  /** Called when the item is activated (Flutter `onTap`). */
  onTap?: (event: React.MouseEvent<HTMLElement>) => void
  /** Replaces the composed accessible name verbatim. */
  semanticLabel?: string
  /** Wording for the count in the accessible name (default "N unread"). */
  formatCountLabel?: NavItemCountLabelFormatter
  /** Optional live indicator (e.g. a LiveDot) at the row end or icon corner. */
  liveDot?: React.ReactNode
  /** Render the single child element (e.g. a router `<a>`) instead of a `<button>`. */
  asChild?: boolean
  /** With `asChild`: the element to render as. Its own children are replaced. */
  children?: React.ReactElement
}

/**
 * NavItem — a sidebar or rail destination with an optional capped count badge.
 *
 * Renders a `<button>` by default, or merges onto a link via `asChild`. The
 * accessible name always includes the count ("Chats, 2 unread"); the visual
 * badge is hidden from assistive tech so it is not read twice. When
 * `collapsed`, the label moves into a tooltip and the count onto the icon's
 * corner, and the item becomes a 44 px square target.
 */
export const NavItem = React.forwardRef<HTMLElement, NavItemProps>(function NavItem(
  {
    label,
    icon,
    activeIcon,
    count,
    maxCount,
    selected = false,
    collapsed = false,
    onTap,
    semanticLabel,
    formatCountLabel,
    liveDot,
    asChild = false,
    className,
    onClick,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const api = createNavItem({
    label,
    count,
    maxCount,
    selected,
    collapsed,
    semanticLabel,
    formatCountLabel,
  })
  const iconNode = resolveNavItemIcon(icon, activeIcon, selected)
  const placement = collapsed ? 'corner' : 'inline'

  const badge =
    api.countText === null ? null : (
      <span aria-hidden="true" data-slot="count" className={navItemCountVariants({ placement })}>
        {api.countText}
      </span>
    )
  const dot =
    liveDot == null ? null : (
      <span data-slot="live-dot" className={navItemLiveDotVariants({ placement })}>
        {liveDot}
      </span>
    )

  const content = (
    <>
      {selected && (
        <span aria-hidden="true" data-slot="indicator" className={navItemIndicatorClass} />
      )}
      {(iconNode != null || collapsed) && (
        <span data-slot="icon" className={navItemIconClass}>
          {iconNode != null && <span aria-hidden="true">{iconNode}</span>}
          {collapsed && badge}
          {collapsed && dot}
        </span>
      )}
      {!collapsed && (
        <span data-slot="label" className={navItemLabelClass}>
          {label}
        </span>
      )}
      {!collapsed && (badge || dot) && (
        <span className={navItemTrailingClass}>
          {badge}
          {dot}
        </span>
      )}
    </>
  )

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    onTap?.(event)
  }

  const elementProps = {
    className: cn(
      navItemVariants({
        selected: selected ? 'true' : 'false',
        collapsed: collapsed ? 'true' : 'false',
      }),
      className,
    ),
    ...api.ariaProps,
    ...api.dataAttributes,
    ...props,
    onClick: handleClick,
  }

  const element =
    asChild && React.isValidElement(children) ? (
      <Slot ref={ref} {...elementProps}>
        {React.cloneElement(children, undefined, content)}
      </Slot>
    ) : (
      // The forwarded ref targets whichever element renders; here it is a button.
      <button ref={ref as React.Ref<HTMLButtonElement>} type={type} {...elementProps}>
        {content}
      </button>
    )

  // Always wrapped (the tooltip is disabled when expanded) so toggling
  // `collapsed` keeps the same element tree and never remounts the item,
  // which would drop keyboard focus to <body>.
  return (
    <NavItemTooltip label={label} enabled={collapsed}>
      {element}
    </NavItemTooltip>
  )
})

NavItem.displayName = 'NavItem'

interface NavItemTooltipProps {
  label: string
  /** Collapsed: show the label on hover/focus. Otherwise an inert wrapper. */
  enabled: boolean
  children: React.ReactNode
}

/** Spread onto a disabled trigger to drop the tooltip's `aria-describedby`. */
const INERT_TRIGGER_PROPS = { 'aria-describedby': undefined } as const

/**
 * Shows the label beside a collapsed item on hover/focus via the shared
 * Tooltip. The shared tooltip portals without positioning, so the item's rect
 * is measured on open and the content is fixed beside it. Escape dismisses it
 * (WCAG 1.4.13) without moving focus.
 *
 * When not `enabled` it stays mounted as a `display: contents` wrapper with no
 * tooltip and no extra ARIA, keeping the item's element tree stable.
 */
function NavItemTooltip({ label, enabled, children }: NavItemTooltipProps) {
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null)
  const triggerRef = React.useRef<HTMLSpanElement>(null)
  // Read through a ref: a show-delay timer started while collapsed may fire
  // after the item expands, holding a callback from the earlier render.
  const enabledRef = React.useRef(enabled)
  enabledRef.current = enabled
  const isOpen = enabled && open

  const handleOpenChange = React.useCallback((next: boolean) => {
    if (next && !enabledRef.current) return
    if (next && triggerRef.current) {
      setPosition(getNavItemTooltipPosition(triggerRef.current.getBoundingClientRect()))
    }
    setOpen(next)
  }, [])

  // Expanding while the tooltip is open closes it, so collapsing again later
  // does not show it without a fresh hover/focus.
  React.useEffect(() => {
    if (!enabled) setOpen(false)
  }, [enabled])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Escape' && isOpen) setOpen(false)
  }

  return (
    <Tooltip open={isOpen} onOpenChange={handleOpenChange} placement={COLLAPSED_TOOLTIP_SIDE}>
      <TooltipTrigger
        ref={triggerRef}
        className={navItemTooltipTriggerVariants({ collapsed: enabled ? 'true' : 'false' })}
        onKeyDown={handleKeyDown}
        {...(enabled ? undefined : INERT_TRIGGER_PROPS)}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={COLLAPSED_TOOLTIP_SIDE}
        data-slot="tooltip"
        className={navItemTooltipClass}
        style={position ?? undefined}
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
