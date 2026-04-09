import * as React from 'react'
import {
  createMobileNav,
  mobileNavVariants,
  mobileNavContentVariants,
  mobileNavTriggerVariants,
  mobileNavLinkVariants,
} from '@refraction-ui/mobile-nav'
import { cn, createKeyboardHandler } from '@refraction-ui/shared'

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface MobileNavContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  contentId: string
}

const MobileNavContext = React.createContext<MobileNavContextValue | null>(null)

function useMobileNavContext(): MobileNavContextValue {
  const ctx = React.useContext(MobileNavContext)
  if (!ctx) {
    throw new Error('MobileNav compound components must be used within <MobileNav>')
  }
  return ctx
}

/* ------------------------------------------------------------------ */
/*  MobileNav (root)                                                   */
/* ------------------------------------------------------------------ */

export interface MobileNavProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

/**
 * MobileNav — root wrapper that manages open/closed state via context.
 * Supports both controlled (open + onOpenChange) and uncontrolled (defaultOpen) usage.
 */
export const MobileNav = React.forwardRef<HTMLElement, MobileNavProps>(
  ({ open: controlledOpen, onOpenChange, defaultOpen = false, className, children, ...props }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : uncontrolledOpen

    const setOpen = React.useCallback(
      (value: boolean) => {
        if (!isControlled) {
          setUncontrolledOpen(value)
        }
        onOpenChange?.(value)
      },
      [isControlled, onOpenChange],
    )

    const api = createMobileNav({ open, onOpenChange: setOpen, id: props.id })

    const handleKeyDown = React.useMemo(
      () => createKeyboardHandler(api.keyboardHandlers),
      [open],
    )

    const contextValue = React.useMemo<MobileNavContextValue>(
      () => ({ open, setOpen, contentId: api.contentProps.id as string }),
      [open, setOpen, api.contentProps.id],
    )

    return (
      <MobileNavContext.Provider value={contextValue}>
        <nav
          ref={ref}
          className={cn(mobileNavVariants(), className)}
          onKeyDown={handleKeyDown as unknown as React.KeyboardEventHandler}
          {...props}
        >
          {children}
        </nav>
      </MobileNavContext.Provider>
    )
  },
)

MobileNav.displayName = 'MobileNav'

/* ------------------------------------------------------------------ */
/*  MobileNavTrigger                                                   */
/* ------------------------------------------------------------------ */

export interface MobileNavTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

/**
 * MobileNavTrigger — hamburger button that toggles the mobile nav.
 */
export const MobileNavTrigger = React.forwardRef<HTMLButtonElement, MobileNavTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, contentId } = useMobileNavContext()

    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        aria-label="Toggle menu"
        className={cn(mobileNavTriggerVariants(), className)}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children ?? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        )}
      </button>
    )
  },
)

MobileNavTrigger.displayName = 'MobileNavTrigger'

/* ------------------------------------------------------------------ */
/*  MobileNavContent                                                   */
/* ------------------------------------------------------------------ */

export interface MobileNavContentProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * MobileNavContent — the collapsible dropdown panel that holds nav links.
 */
export const MobileNavContent = React.forwardRef<HTMLDivElement, MobileNavContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, contentId } = useMobileNavContext()
    const state = open ? 'open' : 'closed'

    return (
      <div
        ref={ref}
        id={contentId}
        role="menu"
        data-state={state}
        className={cn(mobileNavContentVariants({ state }), className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)

MobileNavContent.displayName = 'MobileNavContent'

/* ------------------------------------------------------------------ */
/*  MobileNavLink                                                      */
/* ------------------------------------------------------------------ */

export interface MobileNavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

/**
 * MobileNavLink — a styled link inside the mobile nav dropdown.
 */
export const MobileNavLink = React.forwardRef<HTMLAnchorElement, MobileNavLinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        role="menuitem"
        className={cn(mobileNavLinkVariants(), className)}
        {...props}
      >
        {children}
      </a>
    )
  },
)

MobileNavLink.displayName = 'MobileNavLink'
