import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@refraction-ui/shared'
import { FeedbackDialog, FeedbackButton } from '../src/FeedbackDialog.js'

beforeEach(() => {
  resetIdCounter()
})

describe('FeedbackDialog (React SSR)', () => {
  it('does not render when closed', () => {
    const html = renderToString(
      React.createElement(FeedbackDialog, { open: false }),
    )
    expect(html).toBe('')
  })

  it('renders the trigger children when closed (trigger stays mounted)', () => {
    const html = renderToString(
      React.createElement(
        FeedbackDialog,
        null,
        React.createElement(FeedbackButton, null, 'Send Feedback'),
      ),
    )
    expect(html).toContain('Send Feedback')
    expect(html).not.toContain('role="dialog"')
  })

  it('defaultOpen renders the dialog initially without a controlled open', () => {
    const html = renderToString(
      React.createElement(
        FeedbackDialog,
        { defaultOpen: true },
        React.createElement(FeedbackButton, null, 'Send Feedback'),
      ),
    )
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
    expect(html).toContain('Send Feedback')
  })

  it('renders trigger alongside the open dialog', () => {
    const html = renderToString(
      React.createElement(
        FeedbackDialog,
        { open: true },
        React.createElement(FeedbackButton, null, 'Send Feedback'),
      ),
    )
    expect(html).toContain('role="dialog"')
    expect(html).toContain('<button')
  })

  it('renders dialog with form when open', () => {
    const html = renderToString(
      React.createElement(FeedbackDialog, { open: true }),
    )
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
    expect(html).toContain('Send Feedback')
    expect(html).toContain('<textarea')
    expect(html).toContain('Submit')
  })

  it('renders email input', () => {
    const html = renderToString(
      React.createElement(FeedbackDialog, { open: true }),
    )
    expect(html).toContain('type="email"')
    expect(html).toContain('Email')
  })

  it('renders honeypot field hidden from users', () => {
    const html = renderToString(
      React.createElement(FeedbackDialog, { open: true }),
    )
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('position:absolute')
  })

  it('renders submit button', () => {
    const html = renderToString(
      React.createElement(FeedbackDialog, { open: true }),
    )
    expect(html).toContain('Submit')
    expect(html).toContain('<button')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(FeedbackDialog, { open: true, className: 'my-feedback' }),
    )
    expect(html).toContain('my-feedback')
  })

  it('applies feedbackDialogVariants styles', () => {
    const html = renderToString(
      React.createElement(FeedbackDialog, { open: true }),
    )
    expect(html).toContain('z-50')
    expect(html).toContain('rounded-lg')
  })
})

describe('FeedbackButton (React SSR)', () => {
  it('renders a button with default label', () => {
    const html = renderToString(
      React.createElement(FeedbackButton, null),
    )
    expect(html).toContain('<button')
    expect(html).toContain('Feedback')
    expect(html).toContain('aria-label="Send feedback"')
  })

  it('renders with custom children', () => {
    const html = renderToString(
      React.createElement(FeedbackButton, null, 'Send'),
    )
    expect(html).toContain('Send')
  })

  it('passes through additional props', () => {
    const html = renderToString(
      React.createElement(FeedbackButton, { 'data-testid': 'fb-btn' } as any),
    )
    expect(html).toContain('data-testid="fb-btn"')
  })
})
