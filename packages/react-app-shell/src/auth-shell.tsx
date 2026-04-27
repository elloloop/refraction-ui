import * as React from 'react'
import {
  createAuthShell,
  type AuthShellConfig,
  type AuthShellAPI,
} from '@refraction-ui/app-shell'
import { cn } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AuthShellContextValue {
  api: AuthShellAPI
}

const AuthShellContext = React.createContext<AuthShellContextValue | null>(null)

function useAuthShell(): AuthShellContextValue {
  const ctx = React.useContext(AuthShellContext)
  if (!ctx) {
    throw new Error('AuthShell compound components must be used within <AuthShell>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// AuthShell (root)
// ---------------------------------------------------------------------------

export interface AuthShellProps {
  config?: AuthShellConfig
  children?: React.ReactNode
  className?: string
}

function AuthShellRoot({ config, children, className }: AuthShellProps) {
  const apiRef = React.useRef<AuthShellAPI | null>(null)
  if (apiRef.current === null) {
    apiRef.current = createAuthShell(config)
  }
  const api = apiRef.current

  const ctxValue = React.useMemo<AuthShellContextValue>(
    () => ({ api }),
    [api],
  )

  return React.createElement(
    AuthShellContext.Provider,
    { value: ctxValue },
    React.createElement(
      'div',
      {
        ...api.ariaProps,
        className: cn(api.containerClasses, className),
        'data-auth-shell': '',
      },
      children,
    ),
  )
}

AuthShellRoot.displayName = 'AuthShell'

// ---------------------------------------------------------------------------
// AuthShell.Card
// ---------------------------------------------------------------------------

export interface AuthShellCardProps {
  children?: React.ReactNode
  className?: string
}

function AuthShellCard({ children, className }: AuthShellCardProps) {
  const { api } = useAuthShell()

  return React.createElement(
    'div',
    {
      className: cn(api.cardClasses, className),
      'data-auth-card': '',
    },
    children,
  )
}

AuthShellCard.displayName = 'AuthShell.Card'

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const AuthShell = Object.assign(AuthShellRoot, {
  Card: AuthShellCard,
})

export type { AuthShellConfig, AuthShellAPI }
