// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthShellConfig {
  /** Card max-width preset (default 'sm') */
  maxWidth?: 'xs' | 'sm' | 'md'
  /** Card position (default 'center') */
  position?: 'center' | 'left'
  /** Show decorative background pattern (default true) */
  showBackground?: boolean
}

export interface AuthShellAPI {
  /** Resolved config with all defaults */
  config: Required<AuthShellConfig>
  /** Tailwind classes for the outer container */
  containerClasses: string
  /** Tailwind classes for the card */
  cardClasses: string
  /** ARIA attributes for the auth region */
  ariaProps: Record<string, string>
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULTS: Required<AuthShellConfig> = {
  maxWidth: 'sm',
  position: 'center',
  showBackground: true,
}

// ---------------------------------------------------------------------------
// Class maps
// ---------------------------------------------------------------------------

const MAX_WIDTH_CLASSES: Record<AuthShellConfig['maxWidth'] & string, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createAuthShell(config?: AuthShellConfig): AuthShellAPI {
  const resolved: Required<AuthShellConfig> = {
    ...DEFAULTS,
    ...(config ? Object.fromEntries(Object.entries(config).filter(([_, v]) => v !== undefined)) : {})
  } as Required<AuthShellConfig>

  const containerParts: string[] = ['min-h-screen', 'flex', 'w-full']

  if (resolved.position === 'center') {
    containerParts.push('items-center', 'justify-center')
  } else {
    // left-aligned: vertically centered, padded from left
    containerParts.push('items-center', 'justify-start', 'pl-8 sm:pl-16 lg:pl-24')
  }

  if (resolved.showBackground) {
    containerParts.push('bg-muted')
  }

  const cardParts: string[] = [
    'w-full',
    MAX_WIDTH_CLASSES[resolved.maxWidth],
    'rounded-lg',
    'border',
    'bg-card',
    'p-6',
    'shadow-sm',
  ]

  return {
    config: resolved,
    containerClasses: containerParts.join(' '),
    cardClasses: cardParts.join(' '),
    ariaProps: {
      role: 'main',
      'aria-label': 'Authentication',
    },
  }
}
