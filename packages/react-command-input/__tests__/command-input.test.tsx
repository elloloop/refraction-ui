import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { CommandInput } from '../src/command-input.js'

// SSR suite — structure only. Trigger detection (e.g. `@`/`/` after a word
// boundary) and the popover lifecycle are driven by contentEditable DOM input
// events in the core's `useEffect` wiring, so they cannot run under SSR; the
// headless trigger logic itself is covered by packages/command-input's core
// tests.

describe('CommandInput (React)', () => {
  it('renders a relative wrapper div', () => {
    const html = renderToString(React.createElement(CommandInput, null))
    expect(html).toContain('relative w-full')
  })

  it('renders a contentEditable input area with base classes', () => {
    const html = renderToString(React.createElement(CommandInput, null))
    expect(html).toContain('contentEditable="true"')
    expect(html).toContain('min-h-[40px]')
    expect(html).toContain('border-gray-300')
  })

  it('appends a custom className to the wrapper', () => {
    const html = renderToString(React.createElement(CommandInput, { className: 'my-command' }))
    expect(html).toContain('my-command')
    expect(html).toContain('relative w-full')
  })

  it('spreads additional HTML attributes onto the editable div', () => {
    const html = renderToString(
      React.createElement(CommandInput, { 'aria-label': 'Command', id: 'cmd' }),
    )
    expect(html).toContain('aria-label="Command"')
    expect(html).toContain('id="cmd"')
  })

  it('does not render the controlled value during SSR (applied on mount)', () => {
    // The value is synced into the contentEditable via useEffect, which does
    // not run on the server — SSR output stays empty.
    const html = renderToString(React.createElement(CommandInput, { value: 'hello @ada' }))
    expect(html).not.toContain('hello @ada')
  })

  it('invokes renderPopover with a closed state during SSR', () => {
    const html = renderToString(
      React.createElement(CommandInput, {
        triggers: [{ char: '@' }],
        renderPopover: ({ isOpen }: { isOpen: boolean }) =>
          React.createElement('div', { 'data-slot': 'command-popover' }, isOpen ? 'open' : 'closed'),
      }),
    )
    expect(html).toContain('data-slot="command-popover"')
    expect(html).toContain('closed')
    expect(html).not.toContain('>open<')
  })

  it('renders no popover markup when renderPopover is omitted', () => {
    const html = renderToString(React.createElement(CommandInput, { triggers: [{ char: '@' }] }))
    expect(html).not.toContain('command-popover')
  })
})
