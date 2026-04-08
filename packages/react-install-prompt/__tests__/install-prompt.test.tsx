import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { InstallPrompt } from '../src/install-prompt.js'

describe('InstallPrompt (React)', () => {
  it('renders nothing by default (no beforeinstallprompt event in SSR)', () => {
    const html = renderToString(React.createElement(InstallPrompt))
    // SSR renders nothing because the prompt event hasn't fired
    expect(html).toBe('')
  })

  it('accepts custom message prop', () => {
    // Component won't render in SSR, but should not throw
    const html = renderToString(
      React.createElement(InstallPrompt, { message: 'Install now!' }),
    )
    expect(html).toBe('')
  })

  it('accepts custom labels', () => {
    const html = renderToString(
      React.createElement(InstallPrompt, {
        installLabel: 'Get App',
        dismissLabel: 'No thanks',
      }),
    )
    // Does not render in SSR, but no error
    expect(html).toBe('')
  })

  it('accepts custom className', () => {
    const html = renderToString(
      React.createElement(InstallPrompt, { className: 'my-prompt' }),
    )
    expect(html).toBe('')
  })
})
