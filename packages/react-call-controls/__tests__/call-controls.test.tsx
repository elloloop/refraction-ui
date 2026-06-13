import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { CallControls, CallControlButton } from '../src/call-controls.js'

const renderControls = (props: Record<string, unknown> = {}) =>
  renderToString(React.createElement(CallControls, props))

const renderButton = (props: Record<string, unknown>) =>
  renderToString(React.createElement(CallControlButton, props))

describe('CallControls (SSR)', () => {
  it('renders role="toolbar"', () => {
    const html = renderControls()
    expect(html).toContain('role="toolbar"')
  })

  it('renders aria-label="Call controls"', () => {
    const html = renderControls()
    expect(html).toContain('aria-label="Call controls"')
  })

  it('renders children inside the toolbar', () => {
    const html = renderToString(
      React.createElement(
        CallControls,
        {},
        React.createElement(CallControlButton, { label: 'Mute' }),
        React.createElement(CallControlButton, { label: 'Leave', tone: 'destructive' }),
      ),
    )
    expect(html).toContain('role="toolbar"')
    expect(html).toContain('aria-label="Mute"')
    expect(html).toContain('aria-label="Leave"')
  })
})

describe('CallControlButton (SSR)', () => {
  it('renders aria-label from label prop', () => {
    const html = renderButton({ label: 'Share screen' })
    expect(html).toContain('aria-label="Share screen"')
  })

  it('renders aria-pressed when pressed=true', () => {
    const html = renderButton({ label: 'Mic', pressed: true })
    expect(html).toContain('aria-pressed="true"')
  })

  it('renders aria-pressed="false" when pressed=false', () => {
    const html = renderButton({ label: 'Camera', pressed: false })
    expect(html).toContain('aria-pressed="false"')
  })

  it('omits aria-pressed when pressed is not provided', () => {
    const html = renderButton({ label: 'React' })
    expect(html).not.toContain('aria-pressed')
  })

  it('applies destructive tone class for leave button', () => {
    const html = renderButton({ label: 'Leave', tone: 'destructive' })
    expect(html).toContain('bg-destructive')
  })

  it('applies active tone class', () => {
    const html = renderButton({ label: 'Mic on', tone: 'active' })
    expect(html).toContain('bg-primary')
  })
})
