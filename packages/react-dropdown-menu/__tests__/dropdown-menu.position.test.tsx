// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  computeMenuPosition,
} from '../src/dropdown-menu.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const rect = { top: 100, bottom: 132, left: 40, right: 140, width: 100 }

describe('computeMenuPosition', () => {
  it('places the menu under the trigger with the offset, aligned by edge', () => {
    expect(computeMenuPosition(rect, 200, 'start', 4)).toEqual({ position: 'fixed', top: 136, left: 40, minWidth: 100 })
    expect(computeMenuPosition(rect, 60, 'end', 4).left).toBe(80)
    expect(computeMenuPosition(rect, 60, 'center', 4).left).toBe(60)
  })

  it('never positions off the left edge of the viewport', () => {
    expect(computeMenuPosition(rect, 400, 'end', 4).left).toBe(0)
  })
})

describe('DropdownMenuContent anchoring and dismissal', () => {
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

  function renderMenu() {
    act(() =>
      root.render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Rename</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      ),
    )
    const trigger = container.querySelector('button')!
    trigger.getBoundingClientRect = () => ({ ...rect, x: rect.left, y: rect.top, height: 32, toJSON: () => ({}) }) as DOMRect
    act(() => trigger.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    return trigger
  }

  it('anchors the portalled menu under the trigger', () => {
    renderMenu()
    const menu = document.body.querySelector<HTMLElement>('[role="menu"]')!
    expect(menu.style.position).toBe('fixed')
    expect(menu.style.top).toBe('136px')
    expect(menu.style.left).toBe('40px')
  })

  it('closes on a pointer press outside, not inside', () => {
    renderMenu()
    const menu = document.body.querySelector<HTMLElement>('[role="menu"]')!
    act(() => menu.dispatchEvent(new Event('pointerdown', { bubbles: true })))
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull()
    act(() => document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })))
    expect(document.body.querySelector('[role="menu"]')).toBeNull()
  })
})
