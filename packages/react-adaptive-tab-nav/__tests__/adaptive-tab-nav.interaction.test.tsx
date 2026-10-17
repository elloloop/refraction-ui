// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { AdaptiveTabNav, type AdaptiveTabNavItem } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

type Section = 'home' | 'inbox' | 'settings'

const ITEMS: readonly AdaptiveTabNavItem<Section>[] = [
  { id: 'home', label: 'Home' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'settings', label: 'Settings' },
]

/** The caller owns the active section, as a router would. */
function Harness({ onNavigate }: { onNavigate: (id: Section) => void }) {
  const [active, setActive] = React.useState<Section | null>('home')
  return (
    <AdaptiveTabNav
      items={ITEMS}
      active={active}
      onSelect={(id) => {
        onNavigate(id)
        setActive(id)
      }}
      aria-label="Sections"
    />
  )
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const button = (name: string) =>
  [...container.querySelectorAll('button')].find((b) => b.textContent === name)!
const current = () => container.querySelector('[aria-current="page"]')?.textContent ?? null

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

describe('AdaptiveTabNav interaction', () => {
  it('hands the chosen id to the caller, which moves the current page', () => {
    const onNavigate = vi.fn()
    act(() => root.render(<Harness onNavigate={onNavigate} />))
    expect(current()).toBe('Home')
    click(button('Settings'))
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(onNavigate).toHaveBeenCalledWith('settings')
    expect(current()).toBe('Settings')
    expect(button('Home').getAttribute('data-state')).toBe('inactive')
  })

  it('selecting the current section again still reports it, so the caller can refresh or scroll to top', () => {
    const onNavigate = vi.fn()
    act(() => root.render(<Harness onNavigate={onNavigate} />))
    click(button('Home'))
    expect(onNavigate).toHaveBeenCalledWith('home')
  })

  it('puts every tab in the keyboard order, in reading order', () => {
    act(() => root.render(<Harness onNavigate={() => {}} />))
    const buttons = [...container.querySelectorAll('button')]
    expect(buttons.map((b) => b.textContent)).toEqual(['Home', 'Inbox', 'Settings'])
    for (const b of buttons) {
      expect(b.tabIndex).toBe(0)
      expect(b.disabled).toBe(false)
    }
    button('Inbox').focus()
    expect(document.activeElement).toBe(button('Inbox'))
  })

  it('keeps focus on a tab after it is chosen', () => {
    act(() => root.render(<Harness onNavigate={() => {}} />))
    button('Inbox').focus()
    click(button('Inbox'))
    expect(document.activeElement).toBe(button('Inbox'))
    expect(current()).toBe('Inbox')
  })

  it('forwards its ref to the nav', () => {
    const ref = React.createRef<HTMLElement>()
    act(() => root.render(<AdaptiveTabNav ref={ref} items={ITEMS} active={null} onSelect={() => {}} />))
    expect(ref.current?.tagName).toBe('NAV')
  })
})
