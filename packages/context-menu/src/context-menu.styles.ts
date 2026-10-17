import { cva } from '@refraction-ui/shared'
import { menuContentVariants, menuItemVariants } from '@refraction-ui/dropdown-menu'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/**
 * Menu surface (root and submenus). Builds on DropdownMenu's surface so both
 * menus look the same; it scrolls when clamped to the viewport height and the
 * entry animation stops under `prefers-reduced-motion`.
 */
export const contextMenuContentVariants = cva({
  base: [
    menuContentVariants(),
    'min-w-[8rem] overflow-y-auto p-1 text-popover-foreground outline-none',
    'motion-safe:animate-fade-in-scale motion-reduce:animate-none',
  ].join(' '),
})

/**
 * A menu row (action, checkbox, radio or sub-trigger). Reuses DropdownMenu's
 * item base. The destructive tone's focus colours are scoped to
 * `data-[variant=destructive]` so they out-rank the base `focus:` colours
 * regardless of stylesheet order (`cn` does not merge conflicting utilities).
 */
export const contextMenuItemVariants = cva({
  base: [menuItemVariants(), 'w-full select-none gap-2 text-left', FOCUS_RING].join(' '),
  variants: {
    variant: {
      default: '',
      destructive:
        'text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive',
    },
    inset: {
      true: 'pl-8',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    inset: 'false',
  },
})

/** Extra classes for a sub-trigger: keeps the row highlighted while its submenu is open. */
export const contextMenuSubTriggerClass = 'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground'

/** The check / dot slot of a checkbox or radio row. */
export const contextMenuIndicatorClass = 'pointer-events-none absolute left-2 flex size-4 items-center justify-center'

/** Chevron shown at the end of a sub-trigger. */
export const contextMenuSubChevronClass = 'ml-auto size-4 shrink-0 text-muted-foreground'

/** Keyboard shortcut hint at the end of a row. */
export const contextMenuShortcutClass = 'ml-auto pl-4 text-xs tracking-widest text-muted-foreground'

/** Divider between groups of rows (matches DropdownMenu's separator). */
export const contextMenuSeparatorClass = '-mx-1 my-1 h-px bg-muted'

/** Non-interactive group heading. */
export const contextMenuLabelVariants = cva({
  base: 'px-2 py-1.5 text-sm font-semibold text-foreground',
  variants: {
    inset: {
      true: 'pl-8',
      false: '',
    },
  },
  defaultVariants: {
    inset: 'false',
  },
})

/**
 * The trigger area. Suppresses the iOS long-press callout so the custom menu
 * replaces it, without blocking text selection.
 */
export const contextMenuTriggerClass = '[-webkit-touch-callout:none]'
