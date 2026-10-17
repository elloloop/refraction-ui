// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { NavItem } from '../src/index.js'
import { NAV_ITEM_TOOLTIP_GAP_PX } from '@refraction-ui/nav-item'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

/** The shared Tooltip's default open delay. */
const TOOLTIP_DELAY_MS = 300

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
  vi.useRealTimers()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function item(): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-collapsed]')
  if (!el) throw new Error('nav item not rendered')
  return el
}

function tooltip(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('[role="tooltip"]')
}

describe('NavItem (interaction, jsdom)', () => {
  it('clicking calls onTap and onClick', () => {
    const onTap = vi.fn()
    const onClick = vi.fn()
    render(<NavItem label="Chats" onTap={onTap} onClick={onClick} />)
    act(() => item().click())
    expect(onTap).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is keyboard reachable and focusable', () => {
    render(<NavItem label="Chats" />)
    const el = item()
    expect(el.tabIndex).toBe(0)
    act(() => el.focus())
    expect(document.activeElement).toBe(el)
  })

  it('asChild link keeps the child handler and still fires onTap', () => {
    const onTap = vi.fn()
    const childClick = vi.fn((e: React.MouseEvent) => e.preventDefault())
    render(
      <NavItem asChild label="Chats" onTap={onTap}>
        <a href="/chats" onClick={childClick} />
      </NavItem>,
    )
    const link = item()
    expect(link.tagName).toBe('A')
    act(() => link.click())
    expect(childClick).toHaveBeenCalledTimes(1)
    expect(onTap).toHaveBeenCalledTimes(1)
  })

  it('forwards the ref to the rendered element', () => {
    const ref = React.createRef<HTMLElement>()
    render(<NavItem ref={ref} label="Chats" />)
    expect(ref.current).toBe(item())
  })

  it('updates aria-current when selection changes', () => {
    render(<NavItem label="Chats" />)
    expect(item().getAttribute('aria-current')).toBeNull()
    render(<NavItem label="Chats" selected />)
    expect(item().getAttribute('aria-current')).toBe('page')
  })

  it('updates the accessible name as the count changes', () => {
    render(<NavItem label="Chats" count={1} />)
    expect(item().getAttribute('aria-label')).toBe('Chats, 1 unread')
    render(<NavItem label="Chats" count={120} />)
    expect(item().getAttribute('aria-label')).toBe('Chats, 99+ unread')
    render(<NavItem label="Chats" count={0} />)
    expect(item().getAttribute('aria-label')).toBe('Chats')
  })

  describe('collapsed tooltip', () => {
    it('shows the label beside the item on focus, after the delay', () => {
      vi.useFakeTimers()
      render(<NavItem label="Chats" collapsed icon={<svg />} />)
      const el = item()
      const trigger = el.parentElement as HTMLElement
      trigger.getBoundingClientRect = () =>
        ({ top: 100, left: 0, width: 44, height: 44, right: 44, bottom: 144 }) as DOMRect

      act(() => el.focus())
      expect(tooltip()).toBeNull()
      act(() => {
        vi.advanceTimersByTime(TOOLTIP_DELAY_MS)
      })
      const tip = tooltip()
      expect(tip?.textContent).toBe('Chats')
      // Vertically centred on the item, the default gap to its right.
      expect(tip?.style.top).toBe(`${100 + 44 / 2}px`)
      expect(tip?.style.left).toBe(`${44 + NAV_ITEM_TOOLTIP_GAP_PX}px`)
      expect(tip?.className).toContain('fixed')
      expect(tip?.className).toContain('motion-reduce:animate-none')
      expect(container.contains(tip)).toBe(false)
    })

    it('hides the tooltip on blur', () => {
      vi.useFakeTimers()
      render(<NavItem label="Chats" collapsed icon={<svg />} />)
      act(() => item().focus())
      act(() => {
        vi.advanceTimersByTime(TOOLTIP_DELAY_MS)
      })
      expect(tooltip()).not.toBeNull()
      act(() => item().blur())
      expect(tooltip()).toBeNull()
    })

    it('Escape dismisses the tooltip without moving focus', () => {
      vi.useFakeTimers()
      render(<NavItem label="Chats" collapsed icon={<svg />} />)
      const el = item()
      act(() => el.focus())
      act(() => {
        vi.advanceTimersByTime(TOOLTIP_DELAY_MS)
      })
      expect(tooltip()).not.toBeNull()
      act(() => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      })
      expect(tooltip()).toBeNull()
      expect(document.activeElement).toBe(el)
    })

    it('shows on hover and hides on leave', () => {
      vi.useFakeTimers()
      render(<NavItem label="Chats" collapsed icon={<svg />} />)
      const trigger = item().parentElement as HTMLElement
      act(() => {
        trigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }))
      })
      act(() => {
        vi.advanceTimersByTime(TOOLTIP_DELAY_MS)
      })
      expect(tooltip()?.textContent).toBe('Chats')
      act(() => {
        trigger.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }))
      })
      expect(tooltip()).toBeNull()
    })

    it('keeps the same focused element as collapsed toggles, with no tooltip while expanded', () => {
      vi.useFakeTimers()
      const ref = React.createRef<HTMLElement>()
      const renderAt = (collapsed: boolean) =>
        render(<NavItem ref={ref} label="Chats" collapsed={collapsed} icon={<svg />} />)

      renderAt(true)
      const el = item()
      act(() => el.focus())
      expect(document.activeElement).toBe(el)

      // Expand (e.g. a sidebar keyboard shortcut) before the show delay elapses.
      renderAt(false)
      expect(item()).toBe(el)
      expect(ref.current).toBe(el)
      expect(document.activeElement).toBe(el)
      act(() => {
        vi.advanceTimersByTime(TOOLTIP_DELAY_MS)
      })
      expect(tooltip()).toBeNull()
      expect(el.parentElement?.hasAttribute('aria-describedby')).toBe(false)

      // Hovering the expanded row must not show it either.
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }))
      })
      act(() => {
        vi.advanceTimersByTime(TOOLTIP_DELAY_MS)
      })
      expect(tooltip()).toBeNull()

      renderAt(true)
      expect(item()).toBe(el)
      expect(document.activeElement).toBe(el)
      // No fresh hover/focus since re-collapsing, so nothing pops up.
      expect(tooltip()).toBeNull()
    })

    it('closes an open tooltip when the item expands, keeping focus', () => {
      vi.useFakeTimers()
      const renderAt = (collapsed: boolean) =>
        render(<NavItem label="Chats" collapsed={collapsed} icon={<svg />} />)

      renderAt(true)
      const el = item()
      act(() => el.focus())
      act(() => {
        vi.advanceTimersByTime(TOOLTIP_DELAY_MS)
      })
      expect(tooltip()).not.toBeNull()

      renderAt(false)
      expect(tooltip()).toBeNull()
      expect(document.activeElement).toBe(el)

      renderAt(true)
      expect(tooltip()).toBeNull()
      expect(document.activeElement).toBe(el)
    })

    it('asChild link keeps focus across collapsed toggles', () => {
      const renderAt = (collapsed: boolean) =>
        render(
          <NavItem asChild label="Chats" collapsed={collapsed} icon={<svg />}>
            <a href="/chats" />
          </NavItem>,
        )
      renderAt(true)
      const link = item()
      expect(link.tagName).toBe('A')
      act(() => link.focus())
      renderAt(false)
      expect(document.activeElement).toBe(link)
      renderAt(true)
      expect(document.activeElement).toBe(link)
    })

    it('does not render a tooltip when expanded', () => {
      vi.useFakeTimers()
      render(<NavItem label="Chats" icon={<svg />} />)
      act(() => item().focus())
      act(() => {
        vi.advanceTimersByTime(TOOLTIP_DELAY_MS)
      })
      expect(tooltip()).toBeNull()
    })
  })
})
