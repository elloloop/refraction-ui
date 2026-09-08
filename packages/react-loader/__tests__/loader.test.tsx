import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Spinner, LoadingBar, LoadingOverlay } from '../src/index.js'

/**
 * The rendered markup with React's hoisted stylesheet dropped, so CSS text
 * never satisfies an assertion about the element. The sheet is emitted exactly
 * once, ahead of the markup, so this slices at that known boundary instead of
 * pattern-matching tags — it reads test output, it is not a sanitizer.
 */
const STYLE_END = '</style>'
const markupOnly = (html: string) => {
  const end = html.lastIndexOf(STYLE_END)
  return end === -1 ? html : html.slice(end + STYLE_END.length)
}

describe('Spinner (SSR)', () => {
  it('renders a status region with the variant parts', () => {
    const html = markupOnly(renderToString(<Spinner variant="dots" size="lg" label="Saving" />))
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
    const html = markupOnly(
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
