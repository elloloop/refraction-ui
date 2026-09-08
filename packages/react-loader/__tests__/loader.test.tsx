import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Spinner, LoadingBar, LoadingOverlay } from '../src/index.js'

/** Markup without the hoisted stylesheet, so selectors in the CSS don't match. */
const withoutStyles = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '')

describe('Spinner (SSR)', () => {
  it('renders a status region with the variant parts', () => {
    const html = withoutStyles(renderToString(<Spinner variant="dots" size="lg" label="Saving" />))
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-label="Saving"')
    expect(html).toContain('data-variant="dots"')
    expect(html).toContain('data-size="lg"')
    expect((html.match(/data-part="/g) ?? []).length).toBe(3)
    expect(html).toContain('text-primary')
  })

  it('can be decorative', () => {
    const html = renderToString(<Spinner decorative tone="current" />)
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('role="status"')
  })

  it('ships the stylesheet', () => {
    const html = renderToString(<Spinner />)
    expect(html).toContain('rfr-loader-spin')
  })
})

describe('LoadingBar (SSR)', () => {
  it('renders an indeterminate progressbar', () => {
    const html = renderToString(<LoadingBar placement="fixed" />)
    expect(html).toContain('role="progressbar"')
    expect(html).toContain('data-state="indeterminate"')
    expect(html).toContain('data-placement="fixed"')
    expect(html).toContain('data-part="fill"')
  })

  it('renders a determinate value', () => {
    const html = renderToString(<LoadingBar value={60} thickness={6} />)
    expect(html).toContain('aria-valuenow="60"')
    expect(html).toContain('--rfr-loader-value:60%')
    expect(html).toContain('--rfr-loader-bar-height:6px')
  })
})

describe('LoadingOverlay (SSR)', () => {
  it('renders nothing when closed', () => {
    expect(renderToString(<LoadingOverlay open={false} />)).toBe('')
  })

  it('renders a labelled scrim with a default spinner and message', () => {
    const html = renderToString(<LoadingOverlay scope="contain" message="Saving your answers" />)
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-label="Saving your answers"')
    expect(html).toContain('data-scope="contain"')
    expect(html).toContain('data-variant="ring"')
    expect(html).toContain('Saving your answers')
  })

  it('accepts a custom indicator', () => {
    const html = withoutStyles(
      renderToString(
        <LoadingOverlay label="Loading lesson">
          <Spinner variant="dots" decorative />
        </LoadingOverlay>,
      ),
    )
    expect(html).toContain('data-variant="dots"')
    expect(html).not.toContain('data-variant="ring"')
  })
})
