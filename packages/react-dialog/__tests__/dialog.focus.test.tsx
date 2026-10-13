// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createPortal } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from '../src/dialog.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
let root: Root | undefined
let host: HTMLDivElement
async function show(ui: React.ReactNode) {
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root!.render(ui) })
}
afterEach(async () => {
  if (root) await act(async () => { root!.unmount() })
  root = undefined
  document.body.replaceChildren()
})
function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector)
  if (!found) throw new Error(`Missing ${selector}`)
  return found
}
async function press(key: string, shiftKey = false) {
  const event = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true })
  await act(async () => { document.activeElement!.dispatchEvent(event) })
  return event
}
async function open() {
  const trigger = element<HTMLButtonElement>('[aria-haspopup="dialog"]')
  trigger.focus()
  await act(async () => { trigger.click() })
  return trigger
}

it('focuses the first available control, wraps both directions, and restores the trigger', async () => {
  const ref = React.createRef<HTMLDivElement>()
  await show(<Dialog><DialogTrigger>Open</DialogTrigger><DialogContent ref={ref}>
    <DialogTitle>Preferences</DialogTitle>
    <button hidden>Hidden</button><button disabled>Disabled</button>
    <div style={{ display: 'none' }}><button>Invisible parent</button></div>
    <button tabIndex={-1}>Programmatic only</button><input type="hidden" />
    <input aria-label="Name" /><DialogClose>Done</DialogClose>
  </DialogContent></Dialog>)
  const trigger = await open()
  const first = element('input[aria-label="Name"]')
  expect(document.activeElement).toBe(first)
  expect(ref.current).toBe(element('[role="dialog"]'))
  trigger.focus()
  expect(document.activeElement).toBe(first)
  expect((await press('Tab', true)).defaultPrevented).toBe(true)
  expect(document.activeElement?.textContent).toBe('Done')
  await press('Tab')
  expect(document.activeElement).toBe(first)
  await press('Escape')
  expect(document.querySelector('[role="dialog"]')).toBeNull()
  expect(document.activeElement).toBe(trigger)
  expect(ref.current).toBeNull()
})

it('focuses an empty panel and keeps Tab there until Escape closes it', async () => {
  await show(<Dialog><DialogTrigger>Open</DialogTrigger><DialogContent>
    <DialogTitle>Loading</DialogTitle>
  </DialogContent></Dialog>)
  const trigger = await open()
  const panel = element('[role="dialog"]')
  expect(document.activeElement).toBe(panel)
  expect((await press('Tab')).defaultPrevented).toBe(true)
  expect((await press('Tab', true)).defaultPrevented).toBe(true)
  expect(document.activeElement).toBe(panel)
  await press('Escape')
  expect(document.activeElement).toBe(trigger)
})

it('does not refocus on a controlled rerender with a new callback, and restores on unmount', async () => {
  const trigger = document.createElement('button')
  document.body.appendChild(trigger)
  trigger.focus()
  const ui = () => <Dialog open onOpenChange={() => {}}><DialogContent>
    <DialogTitle>Editor</DialogTitle><input aria-label="First" /><input aria-label="Second" />
  </DialogContent></Dialog>
  await show(ui())
  const second = element('input[aria-label="Second"]')
  second.focus()
  await act(async () => { root!.render(ui()) })
  expect(document.activeElement).toBe(second)
  await act(async () => { root!.unmount() })
  root = undefined
  expect(document.activeElement).toBe(trigger)
})

it('leaves focus alone for a nonmodal dialog', async () => {
  await show(<Dialog modal={false}><DialogTrigger>Open</DialogTrigger><DialogContent>
    <DialogTitle>Information</DialogTitle><button>Action</button>
  </DialogContent></Dialog>)
  const trigger = await open()
  expect(document.activeElement).toBe(trigger)
  element('button:not([aria-haspopup])').focus()
  expect((await press('Tab')).defaultPrevented).toBe(false)
})

it('lets a child cancel Escape before it dismisses the dialog', async () => {
  const changed = vi.fn()
  await show(<Dialog defaultOpen onOpenChange={changed}><DialogContent onKeyDown={e => e.preventDefault()}>
    <DialogTitle>Editor</DialogTitle><button>Action</button>
  </DialogContent></Dialog>)
  await press('Escape')
  expect(changed).not.toHaveBeenCalled()
  expect(element('[role="dialog"]')).toBeTruthy()
})

it('closes only the innermost portal and restores focus to its trigger', async () => {
  await show(<Dialog defaultOpen><DialogContent><DialogTitle>Outer</DialogTitle>
    <Dialog><DialogTrigger>Inner</DialogTrigger><DialogContent>
      <DialogTitle>Inner</DialogTitle><DialogClose>Done</DialogClose>
    </DialogContent></Dialog>
  </DialogContent></Dialog>)
  const trigger = await open()
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2)
  await press('Escape')
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1)
  expect(document.activeElement).toBe(trigger)
  await press('Escape')
  expect(document.querySelector('[role="dialog"]')).toBeNull()
})

it('allows child portals to own focus and cancel their native Escape', async () => {
  function Menu() {
    return createPortal(<button onKeyDown={event => event.nativeEvent.preventDefault()}>Menu item</button>, document.body)
  }
  await show(<Dialog><DialogTrigger>Open</DialogTrigger><DialogContent>
    <DialogTitle>Editor</DialogTitle><input aria-label="Name" /><Menu />
  </DialogContent></Dialog>)
  const trigger = await open()
  const menu = Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Menu item')!
  menu.focus()
  expect(document.activeElement).toBe(menu)
  await press('Escape')
  expect(document.querySelector('[role="dialog"]')).not.toBeNull()
  trigger.focus()
  expect(document.activeElement).toBe(element('input[aria-label="Name"]'))
})
