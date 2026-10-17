// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ShortcutRegistry } from '@refraction-ui/keyboard-shortcut'
import { useShortcut } from '@refraction-ui/react-keyboard-shortcut'
import { ShortcutsDialog, type ShortcutsDialogProps } from '../src/index.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let root: Root | undefined

async function render(ui: React.ReactNode) {
  if (!root) {
    const host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
  }
  await act(async () => {
    root!.render(ui)
  })
}

afterEach(async () => {
  if (root) await act(async () => root!.unmount())
  root = undefined
  document.body.replaceChildren()
})

function dialog(): HTMLElement | null {
  return document.querySelector('[role="dialog"]')
}

function search(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('input[type="search"]')
  if (!input) throw new Error('search field not rendered')
  return input
}

function status(): string {
  return document.querySelector('[role="status"]')?.textContent ?? ''
}

function rowDescriptions(): string[] {
  return Array.from(document.querySelectorAll('[data-shortcut-row] > span:first-child')).map(
    (el) => el.textContent ?? '',
  )
}

async function press(target: EventTarget, init: KeyboardEventInit) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  await act(async () => {
    target.dispatchEvent(event)
  })
  return event
}

async function type(input: HTMLInputElement, value: string) {
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
  await act(async () => {
    setValue.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

function addButton(label: string): HTMLButtonElement {
  const button = document.createElement('button')
  button.textContent = label
  document.body.appendChild(button)
  return button
}

function Dialog(props: Partial<ShortcutsDialogProps>) {
  return <ShortcutsDialog platform="windows" registry={new ShortcutRegistry()} {...props} />
}

describe('opening by shortcut', () => {
  it('opens on ? (typed with Shift) and returns focus to the opener on Escape', async () => {
    const opener = addButton('Somewhere')
    await render(<Dialog />)
    opener.focus()
    const event = await press(opener, { key: '?', shiftKey: true })
    expect(event.defaultPrevented).toBe(true)
    expect(dialog()).not.toBeNull()
    expect(document.activeElement).toBe(search())

    await press(document.activeElement!, { key: 'Escape' })
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(opener)
  })

  it('opens on Ctrl+/ off macOS and on ⌘/ on macOS', async () => {
    await render(<Dialog platform="windows" />)
    await press(document.body, { key: '/', metaKey: true })
    expect(dialog()).toBeNull()
    await press(document.body, { key: '/', ctrlKey: true })
    expect(dialog()).not.toBeNull()

    await press(document.activeElement!, { key: 'Escape' })
    await render(<Dialog platform="mac" />)
    await press(document.body, { key: '/', ctrlKey: true })
    expect(dialog()).toBeNull()
    await press(document.body, { key: '/', metaKey: true })
    expect(dialog()).not.toBeNull()
  })

  it('does not open while typing in an input, textarea or contenteditable', async () => {
    await render(<Dialog />)
    const input = document.createElement('input')
    const textarea = document.createElement('textarea')
    const editor = document.createElement('div')
    editor.setAttribute('contenteditable', 'true')
    const inside = document.createElement('span')
    editor.appendChild(inside)
    document.body.append(input, textarea, editor)

    for (const target of [input, textarea, inside]) {
      const event = await press(target, { key: '?', shiftKey: true })
      expect(event.defaultPrevented).toBe(false)
      await press(target, { key: '/', ctrlKey: true })
    }
    expect(dialog()).toBeNull()
  })

  it('still opens from a checkbox (it does not take text)', async () => {
    await render(<Dialog />)
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    document.body.appendChild(checkbox)
    await press(checkbox, { key: '?', shiftKey: true })
    expect(dialog()).not.toBeNull()
  })

  it('ignores the shortcut when openShortcut is false, or when another handler took it', async () => {
    await render(<Dialog openShortcut={false} />)
    await press(document.body, { key: '?', shiftKey: true })
    expect(dialog()).toBeNull()

    await render(<Dialog />)
    const claimed = (event: KeyboardEvent) => event.preventDefault()
    document.body.addEventListener('keydown', claimed)
    await press(document.body, { key: '?', shiftKey: true })
    document.body.removeEventListener('keydown', claimed)
    expect(dialog()).toBeNull()
  })

  it('stops listening after unmount', async () => {
    await render(<Dialog />)
    await render(null)
    await press(document.body, { key: '?', shiftKey: true })
    expect(dialog()).toBeNull()
  })
})

describe('trigger, close button and controlled mode', () => {
  it('opens from the trigger and the close button returns focus to it', async () => {
    await render(<Dialog trigger={<button>Shortcuts</button>} />)
    const trigger = document.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')!
    trigger.focus()
    await act(async () => trigger.click())
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const close = document.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!
    await act(async () => close.click())
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('reports changes and follows the open prop when controlled', async () => {
    const onOpenChange = vi.fn()
    await render(<Dialog open={false} onOpenChange={onOpenChange} />)
    await press(document.body, { key: '?', shiftKey: true })
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(dialog()).toBeNull()

    await render(<Dialog open onOpenChange={onOpenChange} />)
    await press(document.activeElement!, { key: 'Escape' })
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(dialog()).not.toBeNull()
  })
})

describe('search', () => {
  const shortcuts = [
    { keys: ['Ctrl', 'z'], description: 'Undo', group: 'Editing' },
    { keys: ['Ctrl', 'Shift', 'z'], description: 'Redo', group: 'Editing' },
    { keys: ['g', 'i'], description: 'Go to inbox', group: 'Navigation' },
  ]

  it('filters by description and by key name, announcing the count', async () => {
    await render(<Dialog defaultOpen shortcuts={shortcuts} openShortcut={false} />)
    expect(status()).toBe('3 shortcuts')
    await type(search(), 'inbox')
    expect(rowDescriptions()).toEqual(['Go to inbox'])
    expect(status()).toBe('1 shortcut')
    await type(search(), 'shift')
    expect(rowDescriptions()).toEqual(['Redo'])
    await type(search(), 'control z')
    expect(rowDescriptions()).toEqual(['Redo', 'Undo'])
  })

  it('shows the empty message when nothing matches', async () => {
    await render(<Dialog defaultOpen shortcuts={shortcuts} />)
    await type(search(), 'nothing like this')
    expect(rowDescriptions()).toEqual([])
    expect(document.body.textContent).toContain('No shortcuts match your search.')
    expect(status()).toBe('0 shortcuts')
  })

  it('types ? into the search field without side effects and resets on reopen', async () => {
    await render(<Dialog shortcuts={shortcuts} />)
    await press(document.body, { key: '?', shiftKey: true })
    const typed = await press(search(), { key: '?', shiftKey: true })
    expect(typed.defaultPrevented).toBe(false)
    await type(search(), 'undo')
    await press(search(), { key: 'Escape' })
    await press(document.body, { key: '?', shiftKey: true })
    expect(search().value).toBe('')
    expect(rowDescriptions()).toHaveLength(4)
  })
})

describe('registered shortcuts', () => {
  function Bold({ description }: { description?: string }) {
    useShortcut({ shortcut: 'Ctrl+B', description, group: 'Formatting', onTrigger: () => {} })
    return null
  }

  function App({ withBold, description }: { withBold: boolean; description?: string }) {
    return (
      <>
        {withBold && <Bold description={description} />}
        <ShortcutsDialog platform="windows" defaultOpen />
      </>
    )
  }

  it('lists useShortcut registrations live, and drops them on unmount', async () => {
    await render(<App withBold description="Bold" />)
    expect(rowDescriptions()).toContain('Bold')
    expect(document.body.textContent).toContain('Formatting')

    await render(<App withBold description="Toggle bold" />)
    expect(rowDescriptions()).toContain('Toggle bold')
    expect(rowDescriptions()).not.toContain('Bold')

    await render(<App withBold={false} />)
    expect(rowDescriptions()).not.toContain('Toggle bold')
    expect(document.body.textContent).not.toContain('Formatting')
  })

  it('does not list a registration without a description', async () => {
    await render(<App withBold />)
    expect(rowDescriptions()).toEqual(['Show keyboard shortcuts'])
  })

  it('lists a SANE_DEFAULTS action with its default description', async () => {
    function Saver() {
      useShortcut({ action: 'save', onTrigger: () => {} })
      return null
    }
    await render(
      <>
        <Saver />
        <ShortcutsDialog platform="mac" defaultOpen />
      </>,
    )
    expect(rowDescriptions()).toEqual(['Save', 'Show keyboard shortcuts'])
    expect(document.body.textContent).toContain('Command + S')
  })
})
