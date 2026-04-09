import * as React from 'react'
import {
  createPageShell,
  type PageShellConfig,
  type SectionConfig,
  type PageShellAPI,
} from '@elloloop/app-shell'
import { cn } from '@elloloop/shared'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface PageShellContextValue {
  api: PageShellAPI
}

const PageShellContext = React.createContext<PageShellContextValue | null>(null)

function usePageShell(): PageShellContextValue {
  const ctx = React.useContext(PageShellContext)
  if (!ctx) {
    throw new Error('PageShell compound components must be used within <PageShell>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// PageShell (root)
// ---------------------------------------------------------------------------

export interface PageShellProps {
  config?: PageShellConfig
  children?: React.ReactNode
  className?: string
}

function PageShellRoot({ config, children, className }: PageShellProps) {
  const apiRef = React.useRef<PageShellAPI | null>(null)
  if (apiRef.current === null) {
    apiRef.current = createPageShell(config)
  }
  const api = apiRef.current

  const cssVars = api.getCSSVariables()

  const ctxValue = React.useMemo<PageShellContextValue>(
    () => ({ api }),
    [api],
  )

  return React.createElement(
    PageShellContext.Provider,
    { value: ctxValue },
    React.createElement(
      'div',
      {
        className: cn('flex min-h-screen flex-col', className),
        style: cssVars as React.CSSProperties,
        'data-page-shell': '',
      },
      children,
    ),
  )
}

PageShellRoot.displayName = 'PageShell'

// ---------------------------------------------------------------------------
// PageShell.Nav
// ---------------------------------------------------------------------------

export interface PageShellNavProps {
  children?: React.ReactNode
  className?: string
}

function Nav({ children, className }: PageShellNavProps) {
  const { api } = usePageShell()

  const stickyClass = api.config.navSticky ? 'sticky top-0 z-40' : ''
  const transparentClass = api.config.navTransparent ? 'bg-transparent' : 'bg-background border-b'

  return React.createElement(
    'nav',
    {
      ...api.navAriaProps,
      className: cn(
        'flex items-center h-[var(--page-nav-height)] px-4 sm:px-6 lg:px-8',
        stickyClass,
        transparentClass,
        className,
      ),
    },
    children,
  )
}

Nav.displayName = 'PageShell.Nav'

// ---------------------------------------------------------------------------
// PageShell.Section
// ---------------------------------------------------------------------------

export interface PageShellSectionProps extends SectionConfig {
  children?: React.ReactNode
  className?: string
}

function Section({
  children,
  className,
  fullWidth,
  maxWidth,
  padding,
  background,
}: PageShellSectionProps) {
  const { api } = usePageShell()

  const sectionClasses = api.getSectionClasses({ fullWidth, maxWidth, padding, background })

  return React.createElement(
    'section',
    {
      className: cn('py-12', sectionClasses, className),
    },
    children,
  )
}

Section.displayName = 'PageShell.Section'

// ---------------------------------------------------------------------------
// PageShell.Footer
// ---------------------------------------------------------------------------

export interface PageShellFooterProps {
  children?: React.ReactNode
  className?: string
  columns?: number
}

function Footer({ children, className, columns }: PageShellFooterProps) {
  const { api } = usePageShell()
  const cols = columns ?? api.config.footerColumns

  return React.createElement(
    'footer',
    {
      ...api.footerAriaProps,
      className: cn(
        'border-t bg-muted py-12 px-4 sm:px-6 lg:px-8',
        className,
      ),
    },
    React.createElement(
      'div',
      {
        className: `mx-auto max-w-[var(--page-max-width)] grid gap-8`,
        style: {
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        },
      },
      children,
    ),
  )
}

Footer.displayName = 'PageShell.Footer'

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const PageShell = Object.assign(PageShellRoot, {
  Nav,
  Section,
  Footer,
})

export type { PageShellConfig, SectionConfig, PageShellAPI }
