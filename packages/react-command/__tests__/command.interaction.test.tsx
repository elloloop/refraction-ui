// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from '../src/command.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

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

const render = (ui: React.ReactElement) => act(() => root.render(ui))
const input = () => container.querySelector('input') as HTMLInputElement
const options = () => Array.from(container.querySelectorAll<HTMLElement>('[role="option"]'))
const empty = () => container.textContent?.includes('No results') ?? false

function type(value: string) {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    setter.call(input(), value)
    input().dispatchEvent(new Event('input', { bubbles: true }))
  })
}

function key(k: string) {
  act(() => {
    input().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))
  })
}

function Palette({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <Command>
      <CommandInput placeholder="Search" />
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>
        <CommandItem onSelect={() => onSelect('new')}>New file</CommandItem>
        <CommandItem onSelect={() => onSelect('open')}>Open file</CommandItem>
        <CommandItem value="settings" onSelect={() => onSelect('settings')}>Settings</CommandItem>
      </CommandList>
    </Command>
  )
}

describe('Command interaction', () => {
  it('does not show the empty state while items exist, and highlights the first item', () => {
    render(<Palette onSelect={() => {}} />)
    expect(empty()).toBe(false)
    expect(options().map((o) => o.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false'])
    expect(input().getAttribute('aria-activedescendant')).toBe(options()[0].id)
  })

  it('filters items by the search and shows the empty state when nothing matches', () => {
    render(<Palette onSelect={() => {}} />)
    type('file')
    expect(options().map((o) => o.textContent)).toEqual(['New file', 'Open file'])
    type('zzz')
    expect(options()).toHaveLength(0)
    expect(empty()).toBe(true)
  })

  it('moves the highlight with arrows and selects with Enter', () => {
    const onSelect = vi.fn()
    render(<Palette onSelect={onSelect} />)
    key('ArrowDown')
    expect(options()[1].getAttribute('aria-selected')).toBe('true')
    key('Enter')
    expect(onSelect).toHaveBeenCalledWith('open')
    key('ArrowUp')
    key('ArrowUp')
    expect(options()[2].getAttribute('aria-selected')).toBe('true')
  })

  it('Enter selects the first match after filtering', () => {
    const onSelect = vi.fn()
    render(<Palette onSelect={onSelect} />)
    type('sett')
    key('Enter')
    expect(onSelect).toHaveBeenCalledWith('settings')
  })

  it('click selects an item', () => {
    const onSelect = vi.fn()
    render(<Palette onSelect={onSelect} />)
    act(() => options()[2].dispatchEvent(new MouseEvent('click', { bubbles: true })))
    expect(onSelect).toHaveBeenCalledWith('settings')
  })
})
