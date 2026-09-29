// @vitest-environment jsdom
import { it, expect, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot, type Root } from 'react-dom/client'
import { resetIdCounter } from '@refraction-ui/shared'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../src/dialog.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

function Example() {
  return <Dialog><DialogTrigger>Open</DialogTrigger><DialogContent>
    <DialogTitle>Settings</DialogTitle><DialogDescription>Change preferences</DialogDescription>
  </DialogContent></Dialog>
}

it('hydrates independent dialogs after earlier server requests and preserves portal labels', async () => {
  resetIdCounter()
  renderToString(<Example />)
  const ui = <><Example /><Example /></>
  const container = document.createElement('div')
  container.innerHTML = renderToString(ui)
  document.body.appendChild(container)
  const triggers = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
  const ids = triggers.map(trigger => trigger.getAttribute('aria-controls'))
  expect(new Set(ids).size).toBe(2)
  resetIdCounter()
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  const recoverable: unknown[] = []
  let root: Root | undefined
  try {
    await act(async () => { root = hydrateRoot(container, ui, { onRecoverableError: error => recoverable.push(error) }) })
    expect(errors.mock.calls).toEqual([])
    expect(recoverable).toEqual([])
    expect(Array.from(container.querySelectorAll('button'))).toEqual(triggers)
    for (const trigger of triggers) {
      await act(async () => { trigger.click() })
      const dialog = document.getElementById(trigger.getAttribute('aria-controls')!)!
      expect(dialog.getAttribute('role')).toBe('dialog')
      expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe('Settings')
      expect(document.getElementById(dialog.getAttribute('aria-describedby')!)?.textContent).toBe('Change preferences')
      await act(async () => { trigger.click() })
      expect(document.querySelector('[role="dialog"]')).toBeNull()
    }
    expect(triggers.map(trigger => trigger.getAttribute('aria-controls'))).toEqual(ids)
  } finally {
    if (root) await act(async () => { root!.unmount() })
    container.remove()
    errors.mockRestore()
  }
})

it.each([false, true])('hydrates asChild and composes refs, handlers and cancellation (cleanup: %s)', async (withCleanup) => {
  const outerRef = React.createRef<HTMLButtonElement>()
  const outerCleanup = vi.fn(() => { outerRef.current = null })
  const childCleanup = vi.fn()
  const callbackRef = vi.fn((node: HTMLButtonElement | null) => {
    outerRef.current = node
    return node ? outerCleanup : undefined
  })
  const childRef = vi.fn((node: HTMLButtonElement | null) => withCleanup && node ? childCleanup : undefined)
  const calls: string[] = []
  let cancel = true
  const ui = <Dialog onOpenChange={() => calls.push('open')}>
    <DialogTrigger asChild ref={withCleanup ? callbackRef : outerRef} className="trigger" onClick={() => calls.push('trigger')}>
      <button ref={childRef} className="child" onClick={event => {
        calls.push('child')
        if (cancel) event.preventDefault()
      }}>Open settings</button>
    </DialogTrigger>
    <DialogContent><DialogTitle>Settings</DialogTitle></DialogContent>
  </Dialog>
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  const container = document.createElement('div')
  let root: Root | undefined
  const recoverable: unknown[] = []
  try {
    container.innerHTML = renderToString(ui)
    document.body.appendChild(container)
    expect(container.querySelectorAll('button')).toHaveLength(1)
    const button = container.querySelector('button')!
    expect(button.hasAttribute('asChild')).toBe(false)
    await act(async () => { root = hydrateRoot(container, ui, { onRecoverableError: error => recoverable.push(error) }) })
    expect(errors.mock.calls).toEqual([])
    expect(recoverable).toEqual([])
    expect(outerRef.current).toBe(button)
    expect(childRef).toHaveBeenLastCalledWith(button)
    expect(button.className).toContain('trigger')
    expect(button.className).toContain('child')
    await act(async () => { button.click() })
    expect(calls).toEqual(['child'])
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    cancel = false
    await act(async () => { button.click() })
    expect(calls).toEqual(['child', 'child', 'trigger', 'open'])
    expect(document.querySelector('[role="dialog"]')?.textContent).toBe('Settings')
    await act(async () => { root!.unmount() })
    root = undefined
    expect(outerRef.current).toBeNull()
    if (withCleanup) {
      expect(outerCleanup).toHaveBeenCalled()
      expect(childCleanup).toHaveBeenCalled()
      expect(callbackRef).not.toHaveBeenCalledWith(null)
      expect(childRef).not.toHaveBeenCalledWith(null)
    } else {
      expect(childRef).toHaveBeenLastCalledWith(null)
    }
  } finally {
    if (root) await act(async () => { root!.unmount() })
    container.remove()
    errors.mockRestore()
  }
})
