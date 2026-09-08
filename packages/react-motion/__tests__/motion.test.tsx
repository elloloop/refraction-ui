import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Reveal } from '../src/reveal.js'
import { PageTransition } from '../src/page-transition.js'
import { Stagger } from '../src/stagger.js'
import { CheckDraw } from '../src/check-draw.js'

describe('Reveal (SSR)', () => {
  it('renders the pattern hook on a div by default', () => {
    const html = renderToString(<Reveal pattern="page-in">Hello</Reveal>)
    expect(html).toContain('data-rfr-motion="reveal"')
    expect(html).toContain('data-pattern="page-in"')
    expect(html).toContain('<div')
    expect(html).toContain('Hello')
  })

  it('honours `as`, delay and disabled', () => {
    const html = renderToString(
      <Reveal as="section" pattern="celebrate" delayMs={120} disabled>
        Badge
      </Reveal>,
    )
    expect(html).toContain('<section')
    expect(html).toContain('--rfr-motion-delay:120ms')
    expect(html).toContain('data-disabled="true"')
  })
})

describe('PageTransition (SSR)', () => {
  it('plays forward on first render, vertical by default', () => {
    const html = renderToString(<PageTransition step={0}>Step one</PageTransition>)
    expect(html).toContain('data-slot="page-transition"')
    expect(html).toContain('data-direction="forward"')
    expect(html).toContain('data-pattern="page-in"')
    expect(html).toContain('Step one')
  })

  it('uses side patterns on the horizontal axis', () => {
    const html = renderToString(
      <PageTransition step={2} axis="horizontal" direction="back">
        Lesson
      </PageTransition>,
    )
    expect(html).toContain('data-direction="back"')
    expect(html).toContain('data-pattern="side-prev"')
  })

  it('resolves an explicit back direction on the vertical axis', () => {
    const html = renderToString(<PageTransition direction="back">Previous</PageTransition>)
    expect(html).toContain('data-pattern="page-back"')
  })
})

describe('Stagger (SSR)', () => {
  it('assigns a growing delay per child and caps it', () => {
    const html = renderToString(
      <Stagger>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i}>{`Item ${i}`}</span>
        ))}
      </Stagger>,
    )
    expect(html).toContain('data-rfr-motion="stagger"')
    expect(html).toContain('--rfr-motion-delay:0ms')
    expect(html).toContain('--rfr-motion-delay:45ms')
    expect(html).toContain('--rfr-motion-delay:315ms')
    expect(html).not.toContain('--rfr-motion-delay:360ms')
    expect((html.match(/--rfr-motion-delay:315ms/g) ?? []).length).toBe(3)
  })

  it('respects a custom step and pattern', () => {
    const html = renderToString(
      <Stagger stepMs={100} pattern="handoff" layout="grid">
        <div>a</div>
        <div>b</div>
      </Stagger>,
    )
    expect(html).toContain('data-pattern="handoff"')
    expect(html).toContain('--rfr-motion-delay:100ms')
    expect(html).toContain('grid')
  })
})

describe('CheckDraw (SSR)', () => {
  it('renders a self-drawing path with pathLength 1', () => {
    const html = renderToString(<CheckDraw label="Done" />)
    expect(html).toContain('pathLength="1"')
    expect(html).toContain('data-pattern="check-draw"')
    expect(html).toContain('aria-label="Done"')
    expect(html).toContain('role="img"')
  })

  it('is decorative without a label', () => {
    const html = renderToString(<CheckDraw />)
    expect(html).toContain('aria-hidden="true"')
  })
})

/**
 * The rendered markup with React's hoisted stylesheet dropped, since the sheet
 * itself declares the speed property. It is emitted exactly once, ahead of the
 * markup, so this slices at that known boundary instead of pattern-matching
 * tags — it reads test output, it is not a sanitizer.
 */
const STYLE_END = '</style>'
const markupOnly = (html: string) => {
  const end = html.lastIndexOf(STYLE_END)
  return end === -1 ? html : html.slice(end + STYLE_END.length)
}

describe('speed (SSR)', () => {
  it('leaves the markup clean at the default tempo', () => {
    const html = markupOnly(renderToString(<Reveal pattern="page-in">x</Reveal>))
    expect(html).not.toContain('--rfr-motion-speed')
  })

  it('sets the multiplier on Reveal, PageTransition, Stagger and CheckDraw', () => {
    expect(renderToString(<Reveal pattern="page-in" speed="fast">x</Reveal>)).toContain(
      '--rfr-motion-speed:2',
    )
    expect(renderToString(<PageTransition step={1} speed="slow">x</PageTransition>)).toContain(
      '--rfr-motion-speed:0.5',
    )
    expect(
      renderToString(
        <Stagger speed="brisk">
          <div>a</div>
        </Stagger>,
      ),
    ).toContain('--rfr-motion-speed:1.5')
    expect(renderToString(<CheckDraw speed={2} label="done" />)).toContain('--rfr-motion-speed:2')
  })
})
