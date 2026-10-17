import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { buttonTouchTargetStyles } from '@refraction-ui/button'
import { Button } from '../src/button.js'
import * as adapter from '../src/index.js'

// SSR escapes `&` and `'`, both of which appear in the hit-area classes.
const unescapeHtml = (text: string) =>
  text.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

const classOf = (html: string, tag: string) => {
  const match = html.match(new RegExp(`<${tag}[^>]*class="([^"]*)"`))
  if (!match) throw new Error(`no <${tag}> with a class in: ${html}`)
  return unescapeHtml(match[1]).split(/\s+/)
}

const touchClasses = buttonTouchTargetStyles.split(/\s+/)

describe('Button touchTarget (React)', () => {
  it.each([
    ['icon', 'h-9'],
    ['icon-sm', 'h-8'],
    ['icon-xs', 'h-7'],
  ] as const)('extends the %s hit area and keeps its %s visual height', (size, height) => {
    const html = renderToString(
      <Button size={size} touchTarget aria-label="Star">
        ★
      </Button>,
    )
    const classes = classOf(html, 'button')
    expect(classes).toEqual(expect.arrayContaining(touchClasses))
    expect(classes).toContain(height)
    expect(html).toContain('data-touch-target=""')
    expect(html).toContain('aria-label="Star"')
  })

  it('renders no hit-area classes or data attribute by default', () => {
    const html = renderToString(
      <Button size="icon" aria-label="Star">
        ★
      </Button>,
    )
    expect(html).not.toContain('data-touch-target')
    expect(html).not.toContain('after:min-h-')
  })

  it('does not leak the prop onto the DOM element', () => {
    const html = renderToString(
      <Button size="icon" touchTarget aria-label="Star">
        ★
      </Button>,
    )
    expect(html.toLowerCase()).not.toContain('touchtarget')
  })

  it('applies the hit area to the child element with asChild', () => {
    const html = renderToString(
      <Button asChild size="icon-sm" touchTarget>
        <a href="/starred" aria-label="Starred">
          ★
        </a>
      </Button>,
    )
    const classes = classOf(html, 'a')
    expect(classes).toEqual(expect.arrayContaining(touchClasses))
    expect(classes).toContain('h-8')
    expect(html).toMatch(/<a[^>]*data-touch-target=""/)
  })

  it('re-exports the hit-area classes for custom controls', () => {
    expect(adapter.buttonTouchTargetStyles).toBe(buttonTouchTargetStyles)
  })
})
