// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Sidebar } from '../src/sidebar.js'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const sections = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'D' },
      { label: 'Settings', href: '/settings' },
    ],
  },
  {
    title: 'Help',
    items: [{ label: 'Docs', href: '/docs' }],
  },
]

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

function aside(): HTMLElement {
  const el = container.querySelector('aside')
  if (!el) throw new Error('sidebar not rendered')
  return el
}

function activeLinks(): HTMLAnchorElement[] {
  return Array.from(container.querySelectorAll<HTMLAnchorElement>('a[aria-current="page"]'))
}

describe('Sidebar interaction – collapse toggle', () => {
  it('switches between expanded and collapsed layouts', () => {
    render(React.createElement(Sidebar, { sections, collapsed: false }))

    expect(aside().className).toContain('w-64')
    expect(container.textContent).toContain('Dashboard')
    expect(container.textContent).toContain('Main')

    // Collapsed is controlled — the consumer flips the prop.
    act(() => {
      root.render(React.createElement(Sidebar, { sections, collapsed: true }))
    })

    expect(aside().className).toContain('w-16')
    expect(container.textContent).not.toContain('Dashboard')
    expect(container.textContent).not.toContain('Main')
    // Icons stay visible while collapsed.
    expect(container.textContent).toContain('D')

    act(() => {
      root.render(React.createElement(Sidebar, { sections, collapsed: false }))
    })

    expect(aside().className).toContain('w-64')
    expect(container.textContent).toContain('Dashboard')
  })
})

describe('Sidebar interaction – active item', () => {
  it('moves aria-current when the path changes', () => {
    render(
      React.createElement(Sidebar, { sections, currentPath: '/dashboard' }),
    )

    expect(activeLinks()).toHaveLength(1)
    expect(activeLinks()[0].getAttribute('href')).toBe('/dashboard')

    act(() => {
      root.render(
        React.createElement(Sidebar, { sections, currentPath: '/settings' }),
      )
    })

    expect(activeLinks()).toHaveLength(1)
    expect(activeLinks()[0].getAttribute('href')).toBe('/settings')
  })
})

describe('Sidebar interaction – keyboard navigation', () => {
  it('exposes a navigation landmark', () => {
    render(React.createElement(Sidebar, { sections }))

    const nav = container.querySelector('[role="navigation"]')
    expect(nav).toBeTruthy()
    expect(nav!.getAttribute('aria-label')).toBe('Sidebar')
  })

  it('renders every item as a focusable link in document order', () => {
    render(React.createElement(Sidebar, { sections }))

    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a'))
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/dashboard',
      '/settings',
      '/docs',
    ])

    // Native anchors with href are keyboard-focusable (Tab navigation).
    for (const link of links) {
      act(() => {
        link.focus()
      })
      expect(document.activeElement).toBe(link)
    }
  })
})

describe('Sidebar interaction – mobile behavior', () => {
  it('keeps the hidden-until-md classes in the DOM', () => {
    render(React.createElement(Sidebar, { sections }))

    expect(aside().className).toContain('hidden')
    expect(aside().className).toContain('md:flex')
  })
})
