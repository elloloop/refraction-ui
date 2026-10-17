// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { HighlightText, splitHighlightQuery } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

const markTexts = () => Array.from(container.querySelectorAll('mark'), (m) => m.textContent)

/** Set a controlled input's value the way React's onChange listener sees it. */
function type(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  act(() => {
    setter?.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

const RESULTS = ['Crème brûlée', 'Create new file', 'Open recent', 'Close window']

/** A search box filtering nothing, only highlighting — the CommandDialog pattern. */
function SearchHarness() {
  const [query, setQuery] = React.useState('')
  return (
    <div>
      <input aria-label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>
        {RESULTS.map((result) => (
          <li key={result}>
            <HighlightText text={result} query={splitHighlightQuery(query)} />
          </li>
        ))}
      </ul>
    </div>
  )
}

describe('HighlightText (interaction)', () => {
  it('updates highlights as the user types, keeping every row text intact', () => {
    render(<SearchHarness />)
    const input = container.querySelector<HTMLInputElement>('input')!
    expect(markTexts()).toEqual([])

    type(input, 'cre')
    expect(markTexts()).toEqual(['Crè', 'Cre'])

    type(input, 'creme')
    expect(markTexts()).toEqual(['Crème'])

    type(input, 'new file')
    expect(markTexts()).toEqual(['new', 'file'])

    type(input, '')
    expect(markTexts()).toEqual([])

    const rows = Array.from(container.querySelectorAll('li'), (li) => li.textContent)
    expect(rows).toEqual(RESULTS)
  })

  it('re-renders when matching options toggle', () => {
    const view = (wholeWord: boolean, caseSensitive: boolean) => (
      <HighlightText
        text="Cat concat cat"
        query="cat"
        wholeWord={wholeWord}
        caseSensitive={caseSensitive}
      />
    )
    render(view(false, false))
    expect(markTexts()).toEqual(['Cat', 'cat', 'cat'])
    render(view(true, false))
    expect(markTexts()).toEqual(['Cat', 'cat'])
    render(view(true, true))
    expect(markTexts()).toEqual(['cat'])
  })

  it('forwards the ref to the wrapping span', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(<HighlightText ref={ref} text="hello" query="ell" />)
    expect(ref.current?.tagName).toBe('SPAN')
    expect(ref.current?.querySelector('mark')?.textContent).toBe('ell')
  })

  it('is not focusable and adds no tab stops', () => {
    render(<HighlightText text="Open file" query="file" />)
    expect(container.querySelectorAll('[tabindex]')).toHaveLength(0)
  })
})
