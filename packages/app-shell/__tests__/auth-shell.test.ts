import { describe, it, expect } from 'vitest'
import { createAuthShell } from '../src/auth-shell.js'

// ---------------------------------------------------------------------------
// Default config
// ---------------------------------------------------------------------------

describe('createAuthShell — default config', () => {
  it('returns resolved config with all defaults', () => {
    const api = createAuthShell()
    expect(api.config.maxWidth).toBe('sm')
    expect(api.config.position).toBe('center')
    expect(api.config.showBackground).toBe(true)
  })

  it('respects partial config overrides', () => {
    const api = createAuthShell({ maxWidth: 'md', position: 'left' })
    expect(api.config.maxWidth).toBe('md')
    expect(api.config.position).toBe('left')
    expect(api.config.showBackground).toBe(true) // default
  })
})

// ---------------------------------------------------------------------------
// Container classes
// ---------------------------------------------------------------------------

describe('createAuthShell — containerClasses', () => {
  it('centered layout has items-center and justify-center', () => {
    const api = createAuthShell()
    expect(api.containerClasses).toContain('items-center')
    expect(api.containerClasses).toContain('justify-center')
    expect(api.containerClasses).toContain('min-h-screen')
    expect(api.containerClasses).toContain('flex')
  })

  it('left layout has justify-start and padding', () => {
    const api = createAuthShell({ position: 'left' })
    expect(api.containerClasses).toContain('justify-start')
    expect(api.containerClasses).toContain('pl-8')
    expect(api.containerClasses).not.toContain('justify-center')
  })

  it('showBackground adds bg-muted', () => {
    const api = createAuthShell()
    expect(api.containerClasses).toContain('bg-muted')
  })

  it('showBackground=false omits bg-muted', () => {
    const api = createAuthShell({ showBackground: false })
    expect(api.containerClasses).not.toContain('bg-muted')
  })
})

// ---------------------------------------------------------------------------
// Card classes
// ---------------------------------------------------------------------------

describe('createAuthShell — cardClasses', () => {
  it('default sm card has max-w-sm', () => {
    const api = createAuthShell()
    expect(api.cardClasses).toContain('max-w-sm')
    expect(api.cardClasses).toContain('w-full')
    expect(api.cardClasses).toContain('rounded-lg')
    expect(api.cardClasses).toContain('border')
    expect(api.cardClasses).toContain('bg-card')
    expect(api.cardClasses).toContain('p-6')
    expect(api.cardClasses).toContain('shadow-sm')
  })

  it('xs card has max-w-xs', () => {
    const api = createAuthShell({ maxWidth: 'xs' })
    expect(api.cardClasses).toContain('max-w-xs')
    expect(api.cardClasses).not.toContain('max-w-sm')
  })

  it('md card has max-w-md', () => {
    const api = createAuthShell({ maxWidth: 'md' })
    expect(api.cardClasses).toContain('max-w-md')
    expect(api.cardClasses).not.toContain('max-w-sm')
  })
})

// ---------------------------------------------------------------------------
// ARIA props
// ---------------------------------------------------------------------------

describe('createAuthShell — ARIA', () => {
  it('ariaProps has main role', () => {
    const api = createAuthShell()
    expect(api.ariaProps.role).toBe('main')
  })

  it('ariaProps has Authentication label', () => {
    const api = createAuthShell()
    expect(api.ariaProps['aria-label']).toBe('Authentication')
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('createAuthShell — edge cases', () => {
  it('works with no config', () => {
    const api = createAuthShell()
    expect(api.config).toBeDefined()
    expect(api.containerClasses).toBeTruthy()
    expect(api.cardClasses).toBeTruthy()
    expect(api.ariaProps).toBeDefined()
  })

  it('works with empty config object', () => {
    const api = createAuthShell({})
    expect(api.config.maxWidth).toBe('sm')
  })
})
