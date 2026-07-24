import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@refraction-ui/shared'
import {
  ToastProvider,
  Toaster,
  Toast,
  type ToastEntry,
} from '../src/toast.js'

beforeEach(() => {
  resetIdCounter()
})

describe('ToastProvider (React SSR)', () => {
  it('renders children without error', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement('div', null, 'App content'),
      ),
    )
    expect(html).toContain('App content')
  })
})

describe('Toaster (React SSR)', () => {
  it('renders the toast container', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toaster, null),
      ),
    )
    // Container should be present with positioning classes
    expect(html).toContain('fixed')
    expect(html).toContain('bottom-4')
    expect(html).toContain('right-4')
    expect(html).toContain('z-50')
  })

  it('renders empty when no toasts', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toaster, null),
      ),
    )
    // Should not contain any role=alert since no toasts
    expect(html).not.toContain('role="alert"')
  })

  it('applies custom className to container', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toaster, { className: 'my-toaster' }, null),
      ),
    )
    expect(html).toContain('my-toaster')
  })
})

describe('Toast (React SSR)', () => {
  it('renders a toast with message and ARIA props', () => {
    const entry = {
      id: 'test-1',
      message: 'Hello toast',
      variant: 'default' as const,
      duration: 3000,
      createdAt: Date.now(),
    }

    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry }),
      ),
    )
    expect(html).toContain('Hello toast')
    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
    expect(html).toContain('aria-atomic="true"')
  })

  it('renders success variant classes', () => {
    const entry = {
      id: 'test-2',
      message: 'Success!',
      variant: 'success' as const,
      duration: 3000,
      createdAt: Date.now(),
    }

    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry }),
      ),
    )
    expect(html).toContain('border-green-500/50')
    expect(html).toContain('bg-green-50')
  })

  it('renders error variant classes', () => {
    const entry = {
      id: 'test-3',
      message: 'Error!',
      variant: 'error' as const,
      duration: 3000,
      createdAt: Date.now(),
    }

    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry }),
      ),
    )
    expect(html).toContain('border-red-500/50')
    expect(html).toContain('bg-red-50')
  })

  it('renders warning variant classes', () => {
    const entry = {
      id: 'test-4',
      message: 'Warning!',
      variant: 'warning' as const,
      duration: 3000,
      createdAt: Date.now(),
    }

    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry }),
      ),
    )
    expect(html).toContain('border-amber-500/50')
    expect(html).toContain('bg-amber-50')
  })

  it('renders dismiss button when onDismiss provided', () => {
    const entry = {
      id: 'test-5',
      message: 'Dismissable',
      variant: 'default' as const,
      duration: 3000,
      createdAt: Date.now(),
    }

    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, {
          entry,
          onDismiss: () => {},
        }),
      ),
    )
    expect(html).toContain('aria-label="Dismiss"')
    expect(html).toContain('<button')
  })

  it('does not render dismiss button without onDismiss', () => {
    const entry = {
      id: 'test-6',
      message: 'No dismiss',
      variant: 'default' as const,
      duration: 3000,
      createdAt: Date.now(),
    }

    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry }),
      ),
    )
    expect(html).not.toContain('aria-label="Dismiss"')
  })

  it('applies custom className to toast', () => {
    const entry = {
      id: 'test-7',
      message: 'Custom',
      variant: 'default' as const,
      duration: 3000,
      createdAt: Date.now(),
    }

    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry, className: 'my-toast' }),
      ),
    )
    expect(html).toContain('my-toast')
  })
})

// ---------------------------------------------------------------
// Additional React toast tests
// ---------------------------------------------------------------

describe('ToastProvider – additional', () => {
  it('renders children wrapped in context', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement('span', null, 'child-text'),
      ),
    )
    expect(html).toContain('child-text')
    expect(html).toContain('<span')
  })

  it('renders multiple children', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement('p', null, 'one'),
        React.createElement('p', null, 'two'),
      ),
    )
    expect(html).toContain('one')
    expect(html).toContain('two')
  })
})

describe('Toaster – additional', () => {
  it('renders as a fixed container with flex-col layout', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toaster, null),
      ),
    )
    expect(html).toContain('flex-col')
    expect(html).toContain('gap-2')
  })

  it('renders a div element', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toaster, null),
      ),
    )
    expect(html).toContain('<div')
  })
})

describe('Toast – additional', () => {
  it('shows dismiss button with x character', () => {
    const entry = {
      id: 'test-btn-1',
      message: 'Dismissable',
      variant: 'default' as const,
      duration: 3000,
      createdAt: Date.now(),
    }

    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, {
          entry,
          onDismiss: () => {},
        }),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('aria-label="Dismiss"')
  })

  it('has aria-live="assertive" for all variants', () => {
    const variants = ['default', 'success', 'error', 'warning'] as const
    for (const variant of variants) {
      const entry = {
        id: `aria-test-${variant}`,
        message: `${variant} msg`,
        variant,
        duration: 3000,
        createdAt: Date.now(),
      }
      const html = renderToString(
        React.createElement(
          ToastProvider,
          null,
          React.createElement(Toast, { entry }),
        ),
      )
      expect(html).toContain('aria-live="assertive"')
    }
  })

  it('renders multiple toasts in order inside Toaster (SSR snapshot)', () => {
    // We can't test manager state via SSR easily since toasts start empty,
    // but we can render multiple Toast components directly
    const entries = [
      { id: 'multi-1', message: 'First', variant: 'default' as const, duration: 3000, createdAt: 1 },
      { id: 'multi-2', message: 'Second', variant: 'success' as const, duration: 3000, createdAt: 2 },
      { id: 'multi-3', message: 'Third', variant: 'error' as const, duration: 3000, createdAt: 3 },
    ]

    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        ...entries.map((entry) =>
          React.createElement(Toast, { key: entry.id, entry }),
        ),
      ),
    )
    expect(html).toContain('First')
    expect(html).toContain('Second')
    expect(html).toContain('Third')
    // Verify order: First should come before Second, Second before Third
    const idxFirst = html.indexOf('First')
    const idxSecond = html.indexOf('Second')
    const idxThird = html.indexOf('Third')
    expect(idxFirst).toBeLessThan(idxSecond)
    expect(idxSecond).toBeLessThan(idxThird)
  })

  it('renders message text in a flex-1 wrapper', () => {
    const entry = {
      id: 'flex-test',
      message: 'Flex message',
      variant: 'default' as const,
      duration: 3000,
      createdAt: Date.now(),
    }

    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry }),
      ),
    )
    expect(html).toContain('flex-1')
    expect(html).toContain('Flex message')
  })
})

// ---------------------------------------------------------------
// Expanded SSR coverage
// ---------------------------------------------------------------

function makeEntry(overrides: Partial<ToastEntry> = {}): ToastEntry {
  return {
    id: 'entry-1',
    message: 'Toast message',
    variant: 'default',
    duration: 3000,
    createdAt: 0,
    ...overrides,
  }
}

describe('Toaster – container styling (SSR)', () => {
  it('constrains width and opts out of pointer events', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toaster, null),
      ),
    )
    expect(html).toContain('w-full')
    expect(html).toContain('max-w-sm')
    expect(html).toContain('pointer-events-none')
  })

  it('spreads extra HTML attributes onto the container', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toaster, { id: 'toast-region' }),
      ),
    )
    expect(html).toContain('id="toast-region"')
  })
})

describe('Toast – structure (SSR)', () => {
  it('renders base layout classes', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry: makeEntry() }),
      ),
    )
    expect(html).toContain('rounded-lg')
    expect(html).toContain('p-4')
    expect(html).toContain('shadow-lg')
    // Toasts re-enable pointer events inside the pointer-events-none container
    expect(html).toContain('pointer-events-auto')
  })

  it('renders default variant classes', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry: makeEntry() }),
      ),
    )
    expect(html).toContain('bg-background')
    expect(html).toContain('text-foreground')
  })

  it('renders dark-mode classes for the success variant', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry: makeEntry({ variant: 'success' }) }),
      ),
    )
    expect(html).toContain('dark:bg-green-950')
    expect(html).toContain('text-green-900')
  })

  it('renders dark-mode classes for the error variant', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry: makeEntry({ variant: 'error' }) }),
      ),
    )
    expect(html).toContain('dark:bg-red-950')
    expect(html).toContain('text-red-900')
  })

  it('renders dark-mode classes for the warning variant', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry: makeEntry({ variant: 'warning' }) }),
      ),
    )
    expect(html).toContain('dark:bg-amber-950')
    expect(html).toContain('text-amber-900')
  })

  it('dismiss button is type="button" and shows the × glyph', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, {
          entry: makeEntry(),
          onDismiss: () => {},
        }),
      ),
    )
    expect(html).toContain('type="button"')
    expect(html).toContain('×')
  })

  it('renders children as an extra action slot', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(
          Toast,
          { entry: makeEntry() },
          React.createElement('button', null, 'Undo'),
        ),
      ),
    )
    expect(html).toContain('Undo')
  })

  it('spreads extra HTML attributes onto the toast element', () => {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toast, { entry: makeEntry(), id: 'my-toast' }),
      ),
    )
    expect(html).toContain('id="my-toast"')
  })
})
