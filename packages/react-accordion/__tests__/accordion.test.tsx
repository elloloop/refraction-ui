import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../src/accordion.js'

function renderAccordion(props: Record<string, unknown> = {}) {
  return renderToString(
    React.createElement(
      Accordion,
      props,
      React.createElement(
        AccordionItem,
        { value: 'a' },
        React.createElement(AccordionTrigger, null, 'Section A'),
        React.createElement(AccordionContent, null, 'Body A'),
      ),
      React.createElement(
        AccordionItem,
        { value: 'b' },
        React.createElement(AccordionTrigger, null, 'Section B'),
        React.createElement(AccordionContent, null, 'Body B'),
      ),
    ),
  )
}

describe('Accordion (SSR)', () => {
  it('renders items closed by default', () => {
    const html = renderAccordion()
    // Each item renders data-state on item + trigger + content.
    expect((html.match(/data-state="closed"/g) ?? []).length).toBe(6)
    expect((html.match(/aria-expanded="false"/g) ?? []).length).toBe(2)
    expect((html.match(/hidden=""/g) ?? []).length).toBe(2)
  })

  it('opens the defaultValue item (single)', () => {
    const html = renderAccordion({ defaultValue: 'a' })
    expect(html).toContain('aria-expanded="true"')
    // One content visible, one hidden.
    expect((html.match(/hidden=""/g) ?? []).length).toBe(1)
  })

  it('opens the controlled value items (multiple)', () => {
    const html = renderAccordion({ type: 'multiple', value: ['a', 'b'] })
    expect((html.match(/aria-expanded="true"/g) ?? []).length).toBe(2)
    expect(html).not.toContain('hidden=""')
  })

  it('forwards className onto the root', () => {
    const html = renderAccordion({ className: 'my-accordion' })
    expect(html).toContain('my-accordion')
  })
})
