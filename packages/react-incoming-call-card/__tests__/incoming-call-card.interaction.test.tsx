// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { IncomingCallCard, type IncomingCallCardProps } from '../src/index.js'

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
  document.body.replaceChildren()
  vi.useRealTimers()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function renderCard(props: Partial<IncomingCallCardProps> = {}) {
  const handlers = {
    onAccept: vi.fn(),
    onDecline: vi.fn(),
    onDismiss: vi.fn(),
  }
  render(<IncomingCallCard callerName="Ada Lovelace" {...handlers} {...props} />)
  return handlers
}

function card(): HTMLElement {
  const el = container.querySelector<HTMLElement>('[role="alertdialog"]')
  if (!el) throw new Error('card not rendered')
  return el
}

function button(action: 'accept' | 'decline'): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>(`button[data-action="${action}"]`)
  if (!el) throw new Error(`${action} button not rendered`)
  return el
}

function press(target: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}

function click(target: Element) {
  act(() => {
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    target.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

describe('IncomingCallCard (interaction, jsdom)', () => {
  describe('initial focus', () => {
    it('focuses the card container, not Accept', () => {
      renderCard()
      expect(document.activeElement).toBe(card())
      expect(document.activeElement).not.toBe(button('accept'))
    })

    it('leaves focus alone when autoFocus is false', () => {
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()
      renderCard({ autoFocus: false })
      expect(document.activeElement).toBe(input)
    })

    it('hands focus back to the previous element when the card unmounts', () => {
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()
      renderCard()
      expect(document.activeElement).toBe(card())
      act(() => {
        root.render(<></>)
      })
      expect(document.activeElement).toBe(input)
    })

    it('forwards its ref to the card element', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <IncomingCallCard ref={ref} callerName="Ada" onAccept={() => {}} onDecline={() => {}} />,
      )
      expect(ref.current).toBe(card())
    })
  })

  describe('keyboard', () => {
    it('does nothing on Enter or Space while the card is focused', () => {
      const h = renderCard({ escapeBehavior: 'decline' })
      press(card(), 'Enter')
      press(card(), ' ')
      expect(h.onAccept).not.toHaveBeenCalled()
      expect(h.onDecline).not.toHaveBeenCalled()
      expect(h.onDismiss).not.toHaveBeenCalled()
    })

    it('ignores Esc by default', () => {
      const h = renderCard()
      const event = press(card(), 'Escape')
      expect(event.defaultPrevented).toBe(false)
      expect(h.onDecline).not.toHaveBeenCalled()
      expect(h.onDismiss).not.toHaveBeenCalled()
    })

    it('declines on Esc with escapeBehavior="decline"', () => {
      const h = renderCard({ escapeBehavior: 'decline' })
      const event = press(card(), 'Escape')
      expect(event.defaultPrevented).toBe(true)
      expect(h.onDecline).toHaveBeenCalledTimes(1)
      expect(h.onDismiss).not.toHaveBeenCalled()
    })

    it('dismisses on Esc with escapeBehavior="dismiss", also from a focused button', () => {
      const h = renderCard({ escapeBehavior: 'dismiss' })
      button('accept').focus()
      press(button('accept'), 'Escape')
      expect(h.onDismiss).toHaveBeenCalledTimes(1)
      expect(h.onDecline).not.toHaveBeenCalled()
      expect(h.onAccept).not.toHaveBeenCalled()
    })

    it('does not let Esc bubble to an enclosing handler when it acts', () => {
      const outer = vi.fn()
      document.addEventListener('keydown', outer)
      renderCard({ escapeBehavior: 'decline' })
      press(card(), 'Escape')
      document.removeEventListener('keydown', outer)
      expect(outer).not.toHaveBeenCalled()
    })

    it('lets a consumer onKeyDown cancel the Esc behaviour', () => {
      const h = renderCard({
        escapeBehavior: 'decline',
        onKeyDown: (e) => e.preventDefault(),
      })
      press(card(), 'Escape')
      expect(h.onDecline).not.toHaveBeenCalled()
    })

    it('keeps Accept and Decline reachable by Tab (real buttons in DOM order)', () => {
      renderCard()
      const focusables = card().querySelectorAll('button:not([disabled])')
      expect(Array.from(focusables).map((b) => b.getAttribute('data-action'))).toEqual([
        'decline',
        'accept',
      ])
    })
  })

  describe('pointer', () => {
    it('ignores clicks outside the card', () => {
      const h = renderCard({ escapeBehavior: 'dismiss' })
      const outside = document.createElement('button')
      document.body.appendChild(outside)
      click(outside)
      click(document.body)
      expect(h.onAccept).not.toHaveBeenCalled()
      expect(h.onDecline).not.toHaveBeenCalled()
      expect(h.onDismiss).not.toHaveBeenCalled()
      expect(container.querySelector('[role="alertdialog"]')).not.toBeNull()
    })

    it('fires onAccept and onDecline from their buttons', () => {
      const h = renderCard()
      click(button('accept'))
      expect(h.onAccept).toHaveBeenCalledTimes(1)
      click(button('decline'))
      expect(h.onDecline).toHaveBeenCalledTimes(1)
    })
  })

  describe('countdown', () => {
    it('counts down once a second and calls onTimeout once at zero', () => {
      vi.useFakeTimers()
      const onTimeout = vi.fn()
      const h = renderCard({ timeoutSeconds: 3, onTimeout })
      const timer = () => container.querySelector('[role="timer"]')?.textContent
      expect(timer()).toBe('Ends in 0:03')
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(timer()).toBe('Ends in 0:02')
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(timer()).toBe('Ends in 0:00')
      expect(onTimeout).toHaveBeenCalledTimes(1)
      expect(h.onDecline).not.toHaveBeenCalled()
      expect(card().getAttribute('data-ringing')).toBe('false')
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(onTimeout).toHaveBeenCalledTimes(1)
    })

    it('falls back to onDecline when no onTimeout is given', () => {
      vi.useFakeTimers()
      const h = renderCard({ timeoutSeconds: 1 })
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(h.onDecline).toHaveBeenCalledTimes(1)
    })

    it('does not tick on its own when remaining is controlled', () => {
      vi.useFakeTimers()
      const onTimeout = vi.fn()
      const props = { callerName: 'Ada', onAccept: () => {}, onDecline: () => {}, onTimeout }
      render(<IncomingCallCard {...props} timeoutSeconds={10} remaining={2} />)
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(container.querySelector('[role="timer"]')?.textContent).toBe('Ends in 0:02')
      expect(onTimeout).not.toHaveBeenCalled()
      render(<IncomingCallCard {...props} timeoutSeconds={10} remaining={0} />)
      expect(onTimeout).toHaveBeenCalledTimes(1)
      render(<IncomingCallCard {...props} timeoutSeconds={10} remaining={0} />)
      expect(onTimeout).toHaveBeenCalledTimes(1)
    })

    it('restarts the ring when timeoutSeconds changes after expiry', () => {
      vi.useFakeTimers()
      const onTimeout = vi.fn()
      const base = { callerName: 'Ada', onAccept: () => {}, onDecline: () => {}, onTimeout }
      render(<IncomingCallCard {...base} timeoutSeconds={1} />)
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(onTimeout).toHaveBeenCalledTimes(1)
      render(<IncomingCallCard {...base} timeoutSeconds={2} />)
      expect(card().getAttribute('data-ringing')).toBe('true')
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(onTimeout).toHaveBeenCalledTimes(2)
    })

    it('uses the newest callback without restarting the countdown', () => {
      vi.useFakeTimers()
      const first = vi.fn()
      const second = vi.fn()
      const base = { callerName: 'Ada', onAccept: () => {}, onDecline: () => {}, timeoutSeconds: 2 }
      render(<IncomingCallCard {...base} onTimeout={first} />)
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      render(<IncomingCallCard {...base} onTimeout={second} />)
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(first).not.toHaveBeenCalled()
      expect(second).toHaveBeenCalledTimes(1)
    })
  })
})
