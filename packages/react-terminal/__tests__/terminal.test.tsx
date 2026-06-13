import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Terminal } from '../src/terminal.js'
import type { TerminalLine } from '../src/terminal.js'
import { terminalPromptClass } from '@refraction-ui/terminal'

const render = (props: Partial<React.ComponentProps<typeof Terminal>> & { lines: TerminalLine[] }) =>
  renderToString(React.createElement(Terminal, props))

describe('Terminal (SSR)', () => {
  it('renders role="log" on the container', () => {
    const html = render({ lines: [] })
    expect(html).toContain('role="log"')
  })

  it('renders aria-live="polite" for live-region semantics', () => {
    const html = render({ lines: [] })
    expect(html).toContain('aria-live="polite"')
  })

  it('forwards aria-label to the container', () => {
    const html = render({ lines: [], 'aria-label': 'Run output' })
    expect(html).toContain('aria-label="Run output"')
  })

  it('renders the prompt symbol on command lines', () => {
    const lines: TerminalLine[] = [{ kind: 'command', text: 'python solution.py' }]
    const html = render({ lines, promptSymbol: '$' })
    expect(html).toContain('$')
    expect(html).toContain('python solution.py')
  })

  it('does NOT render the prompt symbol on non-command lines', () => {
    const lines: TerminalLine[] = [{ kind: 'stdout', text: 'Hello, world' }]
    const html = render({ lines })
    // The prompt span should be absent from stdout-only output.
    expect(html).not.toContain(terminalPromptClass)
    expect(html).toContain('Hello, world')
  })

  it('applies distinct classes for each line kind', () => {
    const lines: TerminalLine[] = [
      { kind: 'command', text: 'run' },
      { kind: 'stdout', text: 'ok' },
      { kind: 'stderr', text: 'ERR' },
      { kind: 'info', text: 'INFO' },
      { kind: 'success', text: 'PASS' },
    ]
    const html = render({ lines })
    // stderr must carry the destructive token class
    expect(html).toContain('text-destructive')
    // success must carry the emerald class
    expect(html).toContain('text-emerald-500')
    // info must carry the muted-foreground token
    expect(html).toContain('text-muted-foreground')
  })

  it('uses line id as the React key when provided', () => {
    // Key is a React internal — it won't appear in SSR output, but we can
    // verify that a line with an id renders its text correctly.
    const lines: TerminalLine[] = [{ id: 'line-1', kind: 'stdout', text: 'keyed line' }]
    const html = render({ lines })
    expect(html).toContain('keyed line')
  })
})
