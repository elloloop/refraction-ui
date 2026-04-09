import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@refraction-ui/shared'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../src/dialog.js'

beforeEach(() => {
  resetIdCounter()
})

describe('Dialog (React SSR)', () => {
  it('renders trigger button with aria attributes', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        null,
        React.createElement(DialogTrigger, null, 'Open'),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('Open')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain('aria-controls')
  })

  it('renders trigger with aria-expanded true when open', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogTrigger, null, 'Open'),
      ),
    )
    expect(html).toContain('aria-expanded="true"')
  })

  it('does not render content when closed', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        null,
        React.createElement(DialogContent, null, 'Content'),
      ),
    )
    // Content should not appear in SSR output when closed
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('Content')
  })

  it('renders content with dialog role when open', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogContent, null, 'Hello Dialog'),
      ),
    )
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
    expect(html).toContain('Hello Dialog')
    expect(html).toContain('aria-labelledby')
    expect(html).toContain('aria-describedby')
  })

  it('renders non-modal content', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true, modal: false },
        React.createElement(DialogContent, null, 'Non-modal'),
      ),
    )
    expect(html).toContain('aria-modal="false"')
  })

  it('does not render overlay when closed', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        null,
        React.createElement(DialogOverlay, null),
      ),
    )
    expect(html).toBe('')
  })

  it('renders overlay when open', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogOverlay, null),
      ),
    )
    expect(html).toContain('data-state="open"')
    expect(html).toContain('z-50')
  })

  it('renders DialogHeader with layout classes', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogHeader, null, 'Header'),
      ),
    )
    expect(html).toContain('flex')
    expect(html).toContain('Header')
  })

  it('renders DialogFooter with layout classes', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogFooter, null, 'Footer'),
      ),
    )
    expect(html).toContain('flex')
    expect(html).toContain('Footer')
  })

  it('renders DialogTitle with correct id for aria-labelledby', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(
          React.Fragment,
          null,
          React.createElement(DialogContent, null,
            React.createElement(DialogTitle, null, 'My Title'),
          ),
        ),
      ),
    )
    expect(html).toContain('My Title')
    expect(html).toContain('<h2')
    // The title id should match the aria-labelledby on the content
    expect(html).toContain('rfr-dialog-title')
  })

  it('renders DialogDescription with correct id for aria-describedby', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(
          DialogContent,
          null,
          React.createElement(DialogDescription, null, 'Desc text'),
        ),
      ),
    )
    expect(html).toContain('Desc text')
    expect(html).toContain('<p')
    expect(html).toContain('rfr-dialog-desc')
  })

  it('renders DialogClose as a button', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogClose, null, 'Close'),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('Close')
  })

  it('applies custom className to content', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogContent, { className: 'my-dialog' }, 'Custom'),
      ),
    )
    expect(html).toContain('my-dialog')
  })

  it('renders complete dialog composition', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogTrigger, null, 'Open'),
        React.createElement(DialogOverlay, null),
        React.createElement(
          DialogContent,
          null,
          React.createElement(
            DialogHeader,
            null,
            React.createElement(DialogTitle, null, 'Title'),
            React.createElement(DialogDescription, null, 'Description'),
          ),
          React.createElement(DialogFooter, null,
            React.createElement(DialogClose, null, 'Cancel'),
          ),
        ),
      ),
    )
    expect(html).toContain('Open')
    expect(html).toContain('Title')
    expect(html).toContain('Description')
    expect(html).toContain('Cancel')
    expect(html).toContain('role="dialog"')
  })
})

describe('Dialog (React) - DialogHeader renders', () => {
  it('DialogHeader renders children and has flex class', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogHeader, null, 'My Header'),
      ),
    )
    expect(html).toContain('My Header')
    expect(html).toContain('flex')
  })

  it('DialogHeader renders with custom className', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogHeader, { className: 'custom-header' }, 'Header'),
      ),
    )
    expect(html).toContain('custom-header')
  })
})

describe('Dialog (React) - DialogFooter renders', () => {
  it('DialogFooter renders children and has flex class', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogFooter, null, 'My Footer'),
      ),
    )
    expect(html).toContain('My Footer')
    expect(html).toContain('flex')
  })

  it('DialogFooter renders with custom className', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogFooter, { className: 'custom-footer' }, 'Footer'),
      ),
    )
    expect(html).toContain('custom-footer')
  })
})

describe('Dialog (React) - DialogTitle renders with correct id', () => {
  it('DialogTitle renders an h2 tag', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogContent, null,
          React.createElement(DialogTitle, null, 'Title Text'),
        ),
      ),
    )
    expect(html).toContain('<h2')
    expect(html).toContain('Title Text')
  })

  it('DialogTitle id matches aria-labelledby pattern', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogContent, null,
          React.createElement(DialogTitle, null, 'Title'),
        ),
      ),
    )
    expect(html).toContain('rfr-dialog-title')
  })
})

describe('Dialog (React) - DialogDescription renders with correct id', () => {
  it('DialogDescription renders a p tag', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogContent, null,
          React.createElement(DialogDescription, null, 'Description text'),
        ),
      ),
    )
    expect(html).toContain('<p')
    expect(html).toContain('Description text')
  })

  it('DialogDescription id matches aria-describedby pattern', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogContent, null,
          React.createElement(DialogDescription, null, 'Desc'),
        ),
      ),
    )
    expect(html).toContain('rfr-dialog-desc')
  })
})

describe('Dialog (React) - DialogClose renders button', () => {
  it('DialogClose renders a button element', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogClose, null, 'Close Me'),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('Close Me')
  })

  it('DialogClose renders with type="button"', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogClose, null, 'X'),
      ),
    )
    expect(html).toContain('type="button"')
  })
})

describe('Dialog (React) - nested content children', () => {
  it('renders nested children inside DialogContent', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(
          DialogContent,
          null,
          React.createElement('div', { className: 'nested-child' }, 'Nested'),
          React.createElement('span', null, 'Another child'),
        ),
      ),
    )
    expect(html).toContain('nested-child')
    expect(html).toContain('Nested')
    expect(html).toContain('Another child')
  })
})

describe('Dialog (React) - custom className on DialogContent', () => {
  it('custom className is appended to DialogContent', () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true },
        React.createElement(DialogContent, { className: 'my-custom-dialog' }, 'Content'),
      ),
    )
    expect(html).toContain('my-custom-dialog')
    // Also has base styles
    expect(html).toContain('z-50')
  })
})
