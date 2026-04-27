import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@refraction-ui/shared'
import {
  Sheet,
  SheetTrigger,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  sheetContentVariants,
  sheetOverlayStyles,
} from '../src/sheet.js'

beforeEach(() => {
  resetIdCounter()
})

describe('Sheet (React SSR)', () => {
  it('renders trigger button with aria attributes', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        null,
        React.createElement(SheetTrigger, null, 'Open'),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('Open')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain('aria-controls')
    expect(html).toContain('type="button"')
  })

  it('renders trigger with aria-expanded true when open', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(SheetTrigger, null, 'Open'),
      ),
    )
    expect(html).toContain('aria-expanded="true"')
  })

  it('does not render content when closed', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        null,
        React.createElement(SheetContent, null, 'Hidden'),
      ),
    )
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('Hidden')
  })

  it('renders content with dialog role and a11y wiring when open', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(SheetContent, null, 'Hello Sheet'),
      ),
    )
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
    expect(html).toContain('Hello Sheet')
    expect(html).toContain('aria-labelledby')
    expect(html).toContain('aria-describedby')
    expect(html).toContain('tabindex="-1"')
  })

  it('renders non-modal content', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true, modal: false },
        React.createElement(SheetContent, null, 'Non-modal'),
      ),
    )
    expect(html).toContain('aria-modal="false"')
  })

  it('defaults side to "right" with right-edge slide classes', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(SheetContent, null, 'R'),
      ),
    )
    expect(html).toContain('data-side="right"')
    expect(html).toContain('right-0')
    expect(html).toContain('slide-in-from-right')
  })

  it('side="left" renders left-edge slide classes', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true, side: 'left' },
        React.createElement(SheetContent, null, 'L'),
      ),
    )
    expect(html).toContain('data-side="left"')
    expect(html).toContain('left-0')
    expect(html).toContain('slide-in-from-left')
  })

  it('side="top" renders top-edge slide classes', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true, side: 'top' },
        React.createElement(SheetContent, null, 'T'),
      ),
    )
    expect(html).toContain('data-side="top"')
    expect(html).toContain('top-0')
    expect(html).toContain('slide-in-from-top')
  })

  it('side="bottom" renders bottom-edge slide classes', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true, side: 'bottom' },
        React.createElement(SheetContent, null, 'B'),
      ),
    )
    expect(html).toContain('data-side="bottom"')
    expect(html).toContain('bottom-0')
    expect(html).toContain('slide-in-from-bottom')
  })

  it('SheetContent side prop overrides root side', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true, side: 'right' },
        React.createElement(SheetContent, { side: 'left' }, 'Override'),
      ),
    )
    expect(html).toContain('data-side="left"')
    expect(html).toContain('slide-in-from-left')
  })

  it('content carries data-state="open" when open', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(SheetContent, null, 'X'),
      ),
    )
    expect(html).toContain('data-state="open"')
  })

  it('does not render overlay when closed', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        null,
        React.createElement(SheetOverlay, null),
      ),
    )
    expect(html).toBe('')
  })

  it('renders explicit SheetOverlay when open', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(SheetOverlay, null),
      ),
    )
    expect(html).toContain('data-state="open"')
    expect(html).toContain('z-50')
  })

  it('SheetContent renders an implicit overlay by default', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(SheetContent, null, 'Body'),
      ),
    )
    // overlay div + content div both have data-state="open"
    const matches = html.match(/data-state="open"/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(2)
    expect(html).toContain('bg-black/80')
  })

  it('SheetContent withOverlay={false} omits the implicit overlay', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(
          SheetContent,
          { withOverlay: false },
          'Body',
        ),
      ),
    )
    expect(html).not.toContain('bg-black/80')
    expect(html).toContain('role="dialog"')
  })

  it('renders SheetHeader with layout classes', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(SheetHeader, null, 'Header'),
      ),
    )
    expect(html).toContain('flex')
    expect(html).toContain('Header')
  })

  it('renders SheetFooter with layout classes', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(SheetFooter, null, 'Footer'),
      ),
    )
    expect(html).toContain('flex')
    expect(html).toContain('Footer')
  })

  it('renders SheetTitle with id matching aria-labelledby pattern', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(
          SheetContent,
          null,
          React.createElement(SheetTitle, null, 'My Title'),
        ),
      ),
    )
    expect(html).toContain('My Title')
    expect(html).toContain('<h2')
    expect(html).toContain('rfr-sheet-title')
  })

  it('renders SheetDescription with id matching aria-describedby pattern', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(
          SheetContent,
          null,
          React.createElement(SheetDescription, null, 'Desc text'),
        ),
      ),
    )
    expect(html).toContain('Desc text')
    expect(html).toContain('<p')
    expect(html).toContain('rfr-sheet-desc')
  })

  it('renders SheetClose as a type=button element', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(SheetClose, null, 'Close'),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
    expect(html).toContain('Close')
  })

  it('applies custom className to content alongside variant classes', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true },
        React.createElement(SheetContent, { className: 'my-sheet' }, 'Custom'),
      ),
    )
    expect(html).toContain('my-sheet')
    expect(html).toContain('z-50')
  })

  it('renders complete sheet composition', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: true, side: 'left' },
        React.createElement(SheetTrigger, null, 'Open'),
        React.createElement(
          SheetContent,
          null,
          React.createElement(
            SheetHeader,
            null,
            React.createElement(SheetTitle, null, 'Title'),
            React.createElement(SheetDescription, null, 'Description'),
          ),
          React.createElement(
            SheetFooter,
            null,
            React.createElement(SheetClose, null, 'Cancel'),
          ),
        ),
      ),
    )
    expect(html).toContain('Open')
    expect(html).toContain('Title')
    expect(html).toContain('Description')
    expect(html).toContain('Cancel')
    expect(html).toContain('role="dialog"')
    expect(html).toContain('data-side="left"')
  })
})

describe('sheetContentVariants', () => {
  it('produces right-side classes by default', () => {
    const cls = sheetContentVariants()
    expect(cls).toContain('right-0')
    expect(cls).toContain('slide-in-from-right')
  })

  it('produces side-specific classes for each edge', () => {
    expect(sheetContentVariants({ side: 'top' })).toContain('slide-in-from-top')
    expect(sheetContentVariants({ side: 'bottom' })).toContain('slide-in-from-bottom')
    expect(sheetContentVariants({ side: 'left' })).toContain('slide-in-from-left')
    expect(sheetContentVariants({ side: 'right' })).toContain('slide-in-from-right')
  })

  it('appends user className', () => {
    const cls = sheetContentVariants({ side: 'left', className: 'extra-thing' })
    expect(cls).toContain('extra-thing')
    expect(cls).toContain('slide-in-from-left')
  })
})

describe('sheetOverlayStyles', () => {
  it('contains z-index and background classes', () => {
    expect(sheetOverlayStyles).toContain('z-50')
    expect(sheetOverlayStyles).toContain('bg-black/80')
    expect(sheetOverlayStyles).toContain('fixed')
  })
})

describe('Sheet — controlled vs uncontrolled state', () => {
  it('uncontrolled with defaultOpen=false hides content', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { defaultOpen: false },
        React.createElement(SheetContent, null, 'Hidden'),
      ),
    )
    expect(html).not.toContain('Hidden')
  })

  it('uncontrolled with defaultOpen=true shows content', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { defaultOpen: true },
        React.createElement(SheetContent, null, 'Visible'),
      ),
    )
    expect(html).toContain('Visible')
  })

  it('controlled open prop wins over defaultOpen', () => {
    const html = renderToString(
      React.createElement(
        Sheet,
        { open: false, defaultOpen: true },
        React.createElement(SheetContent, null, 'ShouldHide'),
      ),
    )
    expect(html).not.toContain('ShouldHide')
  })
})
